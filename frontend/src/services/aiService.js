// src/services/aiService.js
// Calls Stefan's backend API for business extraction and site generation.
// Falls back to smart local extraction if the backend is unavailable.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ─── Local fallback extraction (no backend required) ──────────────────────────
// Kept as fallback in case Stefan's backend is down during demo

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
    keywords: ['plumb', 'electric', 'tradie', 'trade', 'install', 'wiring', 'pipe', 'build', 'construct'],
    tag: 'Trade Services', emoji: ['🔧', '⚡', '🏗️'],
    products: ['Emergency Call-Out', 'Installation Service', 'Maintenance Plan'],
    prices: ['POA', 'POA', 'From $99/mo'], bgs: ['#faeeda', '#e6f1fb', '#eaf3de'],
    unit: 'jobs/week',
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

function extractVolume(text) {
  const match = text.match(/\b(\d+)\b/)
  return match ? match[1] : '50'
}

function extractLocation(text) {
  const prep = text.match(/\bin\s+([A-Z][a-zA-Z\s]+?)(?:[,.]|$)/i)
  if (prep) return prep[1].trim().split(/\s+/).slice(0, 2).join(' ')
  const cap = text.match(/\b([A-Z][a-z]{2,})\b/)
  return cap ? cap[1] : 'Your City'
}

function generateName(words) {
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
  const cat = CATEGORY_MAP.find((c) => c.keywords.some((k) => lower.includes(k))) || DEFAULT_CATEGORY
  const name = generateName(words)
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
    keywords: `${cat.tag.toLowerCase()} ${location}, local business, ${location} services`,
    about: `We are ${name}, a passionate ${cat.tag.toLowerCase()} serving ${location}. Our goal is to deliver quality every time.`,
    footerYear: String(new Date().getFullYear()),
  }
}

// ─── Map Stefan's backend response to Div's frontend data shape ───────────────
// Stefan returns: { sessionId, businessId, businessData, siteId, siteContent, templateId, styleTokens, seo }
// Div's frontend expects: { name, tagline, tag, desc, location, slug, volume, unit, products, seoTitle, seoDesc, keywords, about, footerYear }

function mapBackendResponse(extractResult, siteResult) {
  const sc = siteResult.siteContent
  const bd = extractResult.businessData

  return {
    // Core site content from Stefan's siteBuilder
    name: sc.name || bd.businessName,
    tagline: sc.tagline || bd.tagline,
    tag: sc.tag || bd.businessType,
    desc: sc.desc || bd.shortDescription,
    location: sc.location || bd.location,
    slug: sc.slug || sc.name?.toLowerCase().replace(/\s+/g, '-') || 'my-business',
    volume: sc.volume || '50',
    unit: sc.unit || 'units/week',
    products: sc.products || [],

    // SEO
    seoTitle: sc.seoTitle || siteResult.seo?.title || '',
    seoDesc: sc.seoDesc || siteResult.seo?.description || '',
    keywords: sc.keywords || siteResult.seo?.keywords?.join(', ') || '',

    // About
    about: sc.about || bd.uniqueSellingPoint || '',
    footerYear: sc.footerYear || String(new Date().getFullYear()),

    // Extra fields Div's site uses
    templateId: siteResult.templateId,
    styleTokens: siteResult.styleTokens,
    siteId: siteResult.siteId,
    sessionId: extractResult.sessionId,
  }
}

// ─── Backend API path ─────────────────────────────────────────────────────────
async function backendExtract(conversationText) {
  // Step 1: Extract business data
  const extractRes = await fetch(`${API_URL}/api/extract-business-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationText })
  })

  if (!extractRes.ok) {
    const err = await extractRes.json().catch(() => ({}))
    throw new Error(err.message || 'Business extraction failed')
  }

  const extractResult = await extractRes.json()

  // Step 2: Generate the full site
  const siteRes = await fetch(`${API_URL}/api/generate-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: extractResult.sessionId })
  })

  if (!siteRes.ok) {
    const err = await siteRes.json().catch(() => ({}))
    throw new Error(err.message || 'Site generation failed')
  }

  const siteResult = await siteRes.json()

  // Map to Div's frontend data shape
  return mapBackendResponse(extractResult, siteResult)
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function extractBusinessData(input) {
  try {
    return await backendExtract(input)
  } catch (err) {
    console.warn('Backend unavailable, using local fallback:', err.message)
    return localExtract(input)
  }
}

// Kept for compatibility with App.jsx
export function buildFallback(input) {
  return localExtract(input)
}
