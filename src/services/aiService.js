// src/services/aiService.js
// Two-path extraction:
//   1. If VITE_ANTHROPIC_API_KEY is set → call Claude API (best results)
//   2. Otherwise → smart local extraction from keywords (no key needed, works offline)

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

// ─── Local extraction (no API key required) ───────────────────────────────────

// Maps keywords → category metadata
const CATEGORY_MAP = [
  {
    keywords: ['candle', 'wax', 'wick', 'scent', 'aromatherapy'],
    tag: 'Handmade Goods', emoji: ['🕯️', '🌸', '🎁'],
    products: ['Soy Pillar Candle', 'Scented Collection', 'Gift Bundle'],
    prices: ['$24', '$18', '$55'], bgs: ['#faeeda', '#fbeaf0', '#e1f5ee'],
    unit: 'candles/week',
  },
  {
    keywords: ['tailor', 'alteration', 'sew', 'stitch', 'garment', 'clothing', 'dress', 'suit'],
    tag: 'Fashion & Tailoring', emoji: ['👔', '👗', '✂️'],
    products: ['Custom Suit', 'Dress Alteration', 'Express Repair'],
    prices: ['$120', '$35', '$20'], bgs: ['#e6f1fb', '#fbeaf0', '#eaf3de'],
    unit: 'garments/week',
  },
  {
    keywords: ['food', 'produce', 'vegetable', 'fruit', 'organic', 'farm', 'fresh', 'grocery'],
    tag: 'Organic Food', emoji: ['🥬', '🍑', '🧺'],
    products: ['Small Veggie Box', 'Seasonal Fruit Box', 'Family Bundle'],
    prices: ['$28', '$24', '$55'], bgs: ['#eaf3de', '#faeeda', '#e1f5ee'],
    unit: 'boxes/week',
  },
  {
    keywords: ['phone', 'mobile', 'repair', 'screen', 'battery', 'device', 'tech', 'fix'],
    tag: 'Tech Repair', emoji: ['📱', '🔋', '🔧'],
    products: ['Screen Replacement', 'Battery Swap', 'Full Diagnostic'],
    prices: ['$89', '$49', '$25'], bgs: ['#e6f1fb', '#eaf3de', '#faeeda'],
    unit: 'repairs/week',
  },
  {
    keywords: ['bake', 'bread', 'cake', 'pastry', 'cookie', 'dessert', 'sweet'],
    tag: 'Bakery', emoji: ['🍞', '🎂', '🍪'],
    products: ['Sourdough Loaf', 'Custom Cake', 'Cookie Box'],
    prices: ['$12', '$65', '$28'], bgs: ['#faeeda', '#fbeaf0', '#e1f5ee'],
    unit: 'items/week',
  },
  {
    keywords: ['hair', 'salon', 'beauty', 'nail', 'barber', 'cut', 'style', 'colour'],
    tag: 'Beauty & Wellness', emoji: ['💇', '💅', '✨'],
    products: ['Haircut & Style', 'Colour Treatment', 'Full Package'],
    prices: ['$55', '$120', '$180'], bgs: ['#fbeaf0', '#e1f5ee', '#faeeda'],
    unit: 'clients/week',
  },
  {
    keywords: ['tutor', 'teach', 'lesson', 'class', 'coach', 'education', 'learn', 'train'],
    tag: 'Education & Coaching', emoji: ['📚', '🎯', '🏆'],
    products: ['1-on-1 Session', 'Group Class', 'Monthly Programme'],
    prices: ['$60', '$25', '$200'], bgs: ['#e6f1fb', '#eaf3de', '#faeeda'],
    unit: 'sessions/week',
  },
  {
    keywords: ['clean', 'laundry', 'wash', 'housekeep', 'maid', 'domestic'],
    tag: 'Home Services', emoji: ['🧹', '🫧', '🏠'],
    products: ['Standard Clean', 'Deep Clean', 'Weekly Plan'],
    prices: ['$80', '$150', '$280'], bgs: ['#e6f1fb', '#eaf3de', '#fbeaf0'],
    unit: 'jobs/week',
  },
  {
    keywords: ['photo', 'video', 'shoot', 'portrait', 'wedding', 'event', 'film'],
    tag: 'Photography & Video', emoji: ['📷', '🎬', '🎞️'],
    products: ['Portrait Session', 'Event Coverage', 'Video Package'],
    prices: ['$200', '$800', '$1,200'], bgs: ['#e6f1fb', '#faeeda', '#fbeaf0'],
    unit: 'shoots/week',
  },
  {
    keywords: ['jewel', 'ring', 'necklace', 'bracelet', 'earring', 'handcraft', 'accessory'],
    tag: 'Handmade Jewellery', emoji: ['💍', '📿', '✨'],
    products: ['Silver Ring', 'Beaded Necklace', 'Custom Piece'],
    prices: ['$45', '$38', '$120'], bgs: ['#faeeda', '#fbeaf0', '#e6f1fb'],
    unit: 'pieces/week',
  },
]

const DEFAULT_CATEGORY = {
  tag: 'Small Business', emoji: ['⭐', '✨', '🎁'],
  products: ['Core Product', 'Premium Option', 'Bundle Deal'],
  prices: ['$25', '$45', '$80'], bgs: ['#eaf3de', '#e6f1fb', '#faeeda'],
  unit: 'units/week',
}

// Pulls a number (volume) from text like "50 units" or "about 30 a week"
function extractVolume(text) {
  const match = text.match(/\b(\d+)\b/)
  return match ? match[1] : '50'
}

// Pulls a city name — looks for capitalised words after common prepositions
function extractLocation(text) {
  const prep = text.match(/\bin\s+([A-Z][a-zA-Z\s]+?)(?:[,.]|$)/i)
  if (prep) return prep[1].trim().split(/\s+/).slice(0, 2).join(' ')
  const cap = text.match(/\b([A-Z][a-z]{2,})\b/)
  return cap ? cap[1] : 'Your City'
}

// Generates a business name from the most meaningful words
function generateName(words, category) {
  const stopWords = new Set(['i', 'sell', 'make', 'run', 'do', 'we', 'a', 'an', 'the', 'in', 'at', 'and', 'or', 'about', 'per', 'week', 'my', 'our', 'is', 'am', 'are'])
  const meaningful = words.filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
  const adjectives = ['Fresh', 'Pure', 'Local', 'Craft', 'Swift', 'Prime', 'True', 'Fine']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = meaningful[0]
    ? meaningful[0].charAt(0).toUpperCase() + meaningful[0].slice(1)
    : 'Business'
  return `${adj} ${noun}`
}

function localExtract(input) {
  const lower = input.toLowerCase()
  const words = input.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)

  // Find matching category
  const cat = CATEGORY_MAP.find((c) => c.keywords.some((k) => lower.includes(k))) || DEFAULT_CATEGORY

  const name = generateName(words, cat)
  const location = extractLocation(input)
  const volume = extractVolume(input)
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const products = cat.products.map((p, i) => ({
    name: p,
    price: cat.prices[i],
    emoji: cat.emoji[i],
    bg: cat.bgs[i],
  }))

  return {
    name,
    tagline: `${cat.tag} — ${location}`,
    tag: cat.tag,
    desc: `${name} is a ${cat.tag.toLowerCase()} based in ${location}. We pride ourselves on quality, consistency, and personal service for every customer.`,
    location,
    slug,
    volume,
    unit: cat.unit,
    products,
    seoTitle: `${name} — ${cat.tag} in ${location}`,
    seoDesc: `Discover ${name} in ${location}. Quality ${cat.tag.toLowerCase()} with fast turnaround and great service.`,
    keywords: `${cat.tag.toLowerCase()} ${location}, ${words[1] || 'local'} business, ${location} services`,
    about: `We are ${name}, a passionate ${cat.tag.toLowerCase()} serving ${location}. Our goal is to deliver quality every time.`,
    footerYear: '2025',
  }
}

// ─── Anthropic API path (optional — better results) ───────────────────────────

const SYSTEM_PROMPT = `You are a business data extraction engine. Given a short natural-language 
description, extract structured JSON. Return ONLY a valid JSON object — no markdown fences, no preamble.`

const USER_PROMPT = (input) => `
Extract business details from: "${input}"

Return ONLY this JSON (no markdown, no extra text):
{
  "name": "catchy 2-3 word business name",
  "tagline": "compelling tagline under 8 words",
  "tag": "category e.g. Handmade Goods, Tech Repair, Organic Food",
  "desc": "2-sentence hero description addressing visitors",
  "location": "City, Country",
  "slug": "url-safe-slug",
  "volume": "number only e.g. 50",
  "unit": "e.g. candles/week",
  "products": [
    { "name": "product 1", "price": "price with symbol", "emoji": "emoji", "bg": "#hex pastel" },
    { "name": "product 2", "price": "price", "emoji": "emoji", "bg": "#hex" },
    { "name": "product 3", "price": "price", "emoji": "emoji", "bg": "#hex" }
  ],
  "seoTitle": "SEO title under 60 chars",
  "seoDesc": "Meta description under 155 chars",
  "keywords": "3 comma-separated keywords",
  "about": "1-2 sentence about section",
  "footerYear": "2025"
}`

async function apiExtract(input) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
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
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_PROMPT(input) }],
    }),
  })
  if (!response.ok) throw new Error(`API ${response.status}`)
  const data = await response.json()
  const raw = data.content.map((b) => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function extractBusinessData(input) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (apiKey && apiKey !== 'your_anthropic_api_key_here') {
    try {
      return await apiExtract(input)
    } catch {
      // Fall through to local extraction
    }
  }
  return localExtract(input)
}

// Kept for compatibility — same as localExtract
export function buildFallback(input) {
  return localExtract(input)
}
