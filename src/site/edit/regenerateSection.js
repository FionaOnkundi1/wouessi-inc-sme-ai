// src/site/edit/regenerateSection.js
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

const INSTRUCTION = `Answers are provided as [field_key] answer. Use ONLY the answer text — never include the field key, brackets, or question text in your output.`

const SECTION_PROMPTS = {
  hero: (answers, data) => `
You are updating the hero section for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Current tagline: "${data.tagline}"
Current description: "${data.desc}"

Return ONLY valid JSON (no markdown):
{
  "tagline": "improved tagline under 10 words, using the user's own words",
  "desc": "improved 2-sentence description"
}`,

  features: (answers, data) => `
You are updating the features/why-us section for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "features": [
    { "icon": "emoji", "title": "Feature title", "body": "1-2 sentence description" },
    { "icon": "emoji", "title": "Feature title", "body": "1-2 sentence description" },
    { "icon": "emoji", "title": "Feature title", "body": "1-2 sentence description" },
    { "icon": "emoji", "title": "Feature title", "body": "1-2 sentence description" }
  ]
}`,

  testimonials: (answers, data) => `
You are updating testimonials for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "testimonials": [
    { "name": "First name + initial", "location": "${data.location}", "text": "genuine review sentence", "rating": 5 },
    { "name": "First name + initial", "location": "${data.location}", "text": "genuine review sentence", "rating": 5 },
    { "name": "First name + initial", "location": "${data.location}", "text": "genuine review sentence", "rating": 5 }
  ]
}`,

  products: (answers, data) => `
You are updating the products/services for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Current products: ${JSON.stringify(data.products)}

Return ONLY valid JSON (no markdown):
{
  "products": [
    { "name": "product name", "price": "price with currency symbol", "emoji": "single emoji", "bg": "#hex pastel colour" },
    { "name": "product name", "price": "price", "emoji": "emoji", "bg": "#hex" },
    { "name": "product name", "price": "price", "emoji": "emoji", "bg": "#hex" }
  ]
}`,

  about: (answers, data) => `
You are updating the about/mission section for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Current about: "${data.about}"

Return ONLY valid JSON (no markdown):
{
  "about": "updated 2-3 sentence about section in first person",
  "volume": "number only e.g. 80",
  "unit": "e.g. candles/week"
}`,

  values: (answers, data) => `
You are updating the values section for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "values": [
    { "icon": "emoji", "title": "Value name", "body": "1-2 sentences" },
    { "icon": "emoji", "title": "Value name", "body": "1-2 sentences" },
    { "icon": "emoji", "title": "Value name", "body": "1-2 sentences" }
  ]
}`,

  faq: (answers, data) => `
You are updating the FAQ for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "faq": [
    { "q": "question", "a": "answer" },
    { "q": "question", "a": "answer" },
    { "q": "question", "a": "answer" },
    { "q": "question", "a": "answer" }
  ]
}`,

  contact: (answers, data) => `
You are updating contact details for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "location": "City, Country",
  "contactEmail": "email address",
  "contactPhone": "phone number or empty string",
  "openHours": "e.g. Mon-Sat, 9am-5pm",
  "responseTime": "e.g. Within 2 hours"
}`,

  seo: (answers, data) => `
You are updating SEO metadata for "${data.name}", a ${data.tag} in ${data.location}.
${INSTRUCTION}

User answers:
${answers}

Return ONLY valid JSON (no markdown):
{
  "seoTitle": "page title under 60 characters",
  "seoDesc": "meta description under 155 characters",
  "keywords": "3-5 comma-separated keywords"
}`,
}

function localFallback(sectionId, answers, data) {
  const base = { _updated: Date.now() }
  if (sectionId === 'hero') {
    // Extract just the raw answer text — strip the [key] prefix
    const taglineAnswer = answers.split('\n').find(l => l.includes('[tagline]') || l.includes('[diff]'))
    const clean = taglineAnswer ? taglineAnswer.replace(/\[\w+\]\s*/, '').trim() : null
    return { ...base, tagline: clean || data.tagline, desc: data.desc }
  }
  if (sectionId === 'about') return { ...base, about: answers.replace(/\[\w+\]\s*/g, '') || data.about }
  if (sectionId === 'contact') return { ...base, location: data.location }
  return base
}

export async function regenerateSection(sectionId, answers, data) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const promptFn = SECTION_PROMPTS[sectionId]
  if (!promptFn) throw new Error(`Unknown section: ${sectionId}`)

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    await new Promise((r) => setTimeout(r, 1200))
    return localFallback(sectionId, answers, data)
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: 'You are a website content editor. Return only valid JSON. Never include question labels, field keys, or brackets in your output content.',
      messages: [{ role: 'user', content: promptFn(answers, data) }],
    }),
  })

  if (!response.ok) throw new Error(`API ${response.status}`)
  const result = await response.json()
  const raw = result.content.map((b) => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
