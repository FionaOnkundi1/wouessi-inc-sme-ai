# Wouessi Template System
## README for Backend Team

---

## Overview

There are 4 HTML templates. Each is a fully designed, multi-page website.
The backend team's job is to:
1. Detect which template fits the AI-extracted business type
2. Replace all `{{PLACEHOLDER}}` tokens with real AI-extracted values
3. Serve the populated HTML

---

## Template Selection Logic

```js
function selectTemplate(tag) {
  const t = tag.toLowerCase()
  if (/candle|jewel|handmade|craft|gift|retail|shop/.test(t))   return 'retail'
  if (/plumb|electri|clean|repair|trade|builder|paint/.test(t)) return 'trade'
  if (/café|cafe|bake|food|catering|restaurant|farm|produce/.test(t)) return 'hospitality'
  if (/photo|consult|coach|freelance|design|agency/.test(t))    return 'professional'
  return 'retail' // default
}
```

---

## Universal Placeholders (all 4 templates)

| Placeholder | Source | Example |
|---|---|---|
| `{{BUSINESS_NAME}}` | AI extracted `name` | Flame & Craft |
| `{{TAGLINE}}` | AI extracted `tagline` | Artisan Candles, Melbourne |
| `{{TAG}}` | AI extracted `tag` | Handmade Goods |
| `{{LOCATION}}` | AI extracted `location` | Melbourne, AU |
| `{{HERO_DESC}}` | AI extracted `desc` | Small-batch soy candles... |
| `{{ABOUT_PARA_1}}` | AI extracted `about` | We started in... |
| `{{VOLUME}}` | AI extracted `volume` | 50 |
| `{{UNIT}}` | AI extracted `unit` | candles/week |
| `{{CONTACT_EMAIL}}` | AI extracted `contactEmail` | info@flame.com |
| `{{CONTACT_PHONE}}` | AI extracted `contactPhone` | +61 4xx xxx |
| `{{OPEN_HOURS}}` | AI extracted `openHours` | Mon-Sat 9am-5pm |
| `{{SEO_KEYWORDS}}` | AI extracted `keywords` | handmade candles Melbourne |
| `{{PRODUCT_1_NAME}}` | `data.products[0].name` | Soy Pillar Candle |
| `{{PRODUCT_1_PRICE}}` | `data.products[0].price` | $24 |
| `{{PRODUCT_1_EMOJI}}` | `data.products[0].emoji` | 🕯️ |
| `{{TESTIMONIAL_1_TEXT}}` | AI extracted `testimonials[0].text` | Best candles I've found... |
| `{{TESTIMONIAL_1_NAME}}` | AI extracted `testimonials[0].name` | Amara D. |
| `{{FAQ_1_Q}}` | AI extracted `faq[0].q` | Do you deliver? |
| `{{FAQ_1_A}}` | AI extracted `faq[0].a` | Yes, we ship Australia-wide |

---

## Template-specific placeholders

### Retail (`template-retail/`)
Pages: Home, Products, About, Contact
Extra: `{{HERO_H1_LINE1}}`, `{{HERO_H1_LINE2}}`, `{{VALUE_1_TITLE}}`, `{{VALUE_1_DESC}}`, `{{CATEGORY_1}}`, `{{CATEGORY_2}}`, `{{PRODUCTS_DESC}}`, `{{CTA_DESC}}`, `{{CONTACT_INTRO}}`

### Trade (`template-trade/`)
Pages: Home, Services, About, Contact
Extra: `{{SERVICE_1_NAME}}`, `{{SERVICE_1_DESC}}`, `{{SERVICE_1_PRICE}}`, `{{SERVICE_1_EMOJI}}`, `{{WHY_1_TITLE}}`, `{{WHY_1_DESC}}`, `{{CERT_1}}`, `{{CERT_2}}`, `{{SERVICES_DESC}}`

### Food (`template-hospitality/`)
Pages: Home, Menu, About, Contact
Extra: `{{PRODUCT_1_DESC}}`, `{{PRODUCT_1_TAG}}`, `{{HERO_EMOJI}}`, `{{ABOUT_EMOJI}}`, `{{HOURS_WEEKDAY}}`, `{{HOURS_SAT}}`, `{{HOURS_SUN}}`, `{{OPEN_DAYS}}`, `{{ADDRESS}}`, `{{CATEGORY_1}}`, `{{CATEGORY_2}}`, `{{MENU_DESC}}`

### Professional (`template-professional/`)
Pages: Home, Services, About, Contact
Extra: `{{SERVICE_1_NAME}}`, `{{SKILL_1}}`, `{{SKILL_2}}`, `{{SKILL_3}}`, `{{PORTFOLIO_1_EMOJI}}`, `{{PORTFOLIO_1_LABEL}}`, `{{TESTIMONIAL_1_ROLE}}`, `{{RESPONSE_TIME}}`, `{{ABOUT_EMOJI}}`, `{{HERO_EMOJI}}`

---

## How to inject (Node.js example)

```js
const fs = require('fs')
const path = require('path')

function populateTemplate(templateName, data) {
  const file = path.join(__dirname, `template-${templateName}`, 'index.html')
  let html = fs.readFileSync(file, 'utf-8')

  const replacements = {
    '{{BUSINESS_NAME}}':   data.name,
    '{{TAGLINE}}':         data.tagline,
    '{{TAG}}':             data.tag,
    '{{LOCATION}}':        data.location,
    '{{HERO_DESC}}':       data.desc,
    '{{VOLUME}}':          data.volume,
    '{{UNIT}}':            data.unit,
    '{{ABOUT_PARA_1}}':    data.about,
    '{{ABOUT_PARA_2}}':    `We serve ${data.volume}+ customers every week from ${data.location}.`,
    '{{CONTACT_EMAIL}}':   data.contactEmail || `hello@${data.slug}.com`,
    '{{CONTACT_PHONE}}':   data.contactPhone || '',
    '{{OPEN_HOURS}}':      data.openHours || 'Mon–Sat, 9am–5pm',
    '{{SEO_KEYWORDS}}':    data.keywords,
    '{{CTA_DESC}}':        `Join ${data.volume}+ satisfied customers in ${data.location}.`,
    '{{CONTACT_INTRO}}':   `We are real people based in ${data.location}. Reach out and we will get back to you personally.`,
    '{{HERO_H1_LINE1}}':   data.tagline.split(',')[0] || data.name,
    '{{HERO_H1_LINE2}}':   data.tagline.split(',')[1]?.trim() || 'made with love',
    '{{PRODUCT_1_NAME}}':  data.products[0]?.name || '',
    '{{PRODUCT_1_PRICE}}': data.products[0]?.price || '',
    '{{PRODUCT_1_EMOJI}}': data.products[0]?.emoji || '⭐',
    '{{PRODUCT_2_NAME}}':  data.products[1]?.name || '',
    '{{PRODUCT_2_PRICE}}': data.products[1]?.price || '',
    '{{PRODUCT_2_EMOJI}}': data.products[1]?.emoji || '✨',
    '{{PRODUCT_3_NAME}}':  data.products[2]?.name || '',
    '{{PRODUCT_3_PRICE}}': data.products[2]?.price || '',
    '{{PRODUCT_3_EMOJI}}': data.products[2]?.emoji || '🎁',
    // Services (trade/professional)
    '{{SERVICE_1_NAME}}':  data.products[0]?.name || '',
    '{{SERVICE_1_DESC}}':  `Professional ${(data.products[0]?.name || '').toLowerCase()} service in ${data.location}.`,
    '{{SERVICE_1_PRICE}}': data.products[0]?.price || '',
    '{{SERVICE_1_EMOJI}}': data.products[0]?.emoji || '🔧',
    '{{SERVICE_2_NAME}}':  data.products[1]?.name || '',
    '{{SERVICE_2_DESC}}':  `Quality ${(data.products[1]?.name || '').toLowerCase()} with fast turnaround.`,
    '{{SERVICE_2_PRICE}}': data.products[1]?.price || '',
    '{{SERVICE_2_EMOJI}}': data.products[1]?.emoji || '⚡',
    '{{SERVICE_3_NAME}}':  data.products[2]?.name || '',
    '{{SERVICE_3_DESC}}':  `Our most popular ${(data.products[2]?.name || '').toLowerCase()} option.`,
    '{{SERVICE_3_PRICE}}': data.products[2]?.price || '',
    '{{SERVICE_3_EMOJI}}': data.products[2]?.emoji || '✅',
    // Testimonials (use AI-extracted or defaults)
    '{{TESTIMONIAL_1_TEXT}}': data.testimonials?.[0]?.text || 'Absolutely brilliant service.',
    '{{TESTIMONIAL_1_NAME}}': data.testimonials?.[0]?.name || 'Happy Customer',
    '{{TESTIMONIAL_2_TEXT}}': data.testimonials?.[1]?.text || 'Would highly recommend.',
    '{{TESTIMONIAL_2_NAME}}': data.testimonials?.[1]?.name || 'Local Customer',
    '{{TESTIMONIAL_3_TEXT}}': data.testimonials?.[2]?.text || 'Genuinely impressed.',
    '{{TESTIMONIAL_3_NAME}}': data.testimonials?.[2]?.name || 'Repeat Customer',
    // FAQ
    '{{FAQ_1_Q}}': data.faq?.[0]?.q || 'How do I place an order?',
    '{{FAQ_1_A}}': data.faq?.[0]?.a || 'Get in touch via the contact form or call us directly.',
    '{{FAQ_2_Q}}': data.faq?.[1]?.q || 'Do you offer custom orders?',
    '{{FAQ_2_A}}': data.faq?.[1]?.a || 'Yes — contact us to discuss.',
    '{{FAQ_3_Q}}': data.faq?.[2]?.q || 'What is your delivery time?',
    '{{FAQ_3_A}}': data.faq?.[2]?.a || '3-5 business days standard.',
    '{{FAQ_4_Q}}': data.faq?.[3]?.q || 'Are you insured?',
    '{{FAQ_4_A}}': data.faq?.[3]?.a || 'Yes, fully licensed and insured.',
    // Values
    '{{VALUE_1_TITLE}}': data.values?.[0]?.title || 'Quality',
    '{{VALUE_1_DESC}}':  data.values?.[0]?.body  || 'Every item made with care.',
    '{{VALUE_2_TITLE}}': data.values?.[1]?.title || 'Honesty',
    '{{VALUE_2_DESC}}':  data.values?.[1]?.body  || 'Transparent pricing always.',
    '{{VALUE_3_TITLE}}': data.values?.[2]?.title || 'Community',
    '{{VALUE_3_DESC}}':  data.values?.[2]?.body  || `Proudly local in ${data.location}.`,
  }

  Object.entries(replacements).forEach(([key, val]) => {
    html = html.replaceAll(key, val || '')
  })

  return html
}

module.exports = { populateTemplate, selectTemplate }
```

---

## Style reference per template

| Template | Fonts | Primary colour | Vibe |
|---|---|---|---|
| Retail | Cormorant Garamond + DM Sans | `#7A5C3A` bark brown | Warm, artisan, boutique |
| Trade | Barlow Condensed + Barlow | `#F05A28` orange | Bold, industrial, trust |
| Food | Playfair Display + Lato | `#C4622D` terracotta | Warm, inviting, artisan |
| Professional | Libre Baskerville + Sora | `#B8965A` gold | Sharp, editorial, refined |
