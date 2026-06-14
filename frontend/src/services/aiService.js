// src/services/aiService.js
// Calls Stefan's backend API for business extraction and site generation.
// Falls back to smart local extraction if the backend is unavailable.

import { apiRequest, readApiError } from './apiClient'

// ─── Local fallback extraction (no backend required) ──────────────────────────
// Kept as fallback in case Stefan's backend is down during demo

const CATEGORY_MAP = [
  {
    keywords: ['bake', 'bakery', 'bread', 'cake', 'pastry', 'cookie', 'dessert', 'sweet', 'croissant'],
    tag: 'Bakery', emoji: ['🍞', '🎂', '🍪'],
    products: ['Sourdough Loaf', 'Custom Cake', 'Cookie Box'],
    prices: ['$12', '$65', '$28'], bgs: ['#faeeda', '#fbeaf0', '#e1f5ee'],
    unit: 'items/week',
  },
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
  const match = text.match(/\b(\d+)\s*(?:customers|clients|orders|items|jobs|repairs|sessions|shoots|pieces|boxes|candles|garments)?\s*(?:per|\/)?\s*week\b/i)
    || text.match(/\b(?:around|about|roughly|~)\s*(\d+)\b/i)
    || text.match(/\b(\d+)\b/)
  return match ? match[1] : '50'
}

function extractLocation(text) {
  const prep = text.match(/\b(?:based in|located in|serving|around|in)\s+([A-Z][a-zA-Z\s]+?)(?=\s+(?:called|named)|[,.]|$)/i)
  if (prep?.[1]) return cleanLocation(prep[1])
  return 'Your City'
}

function cleanLocation(value) {
  return value
    .replace(/\b(called|named|products|services|target|customer|contact)\b.*$/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(' ') || 'Your City'
}

function inferBusinessName(input, cat) {
  const named = input.match(/\b(?:business name is|called|named|we are|i run|we run|i own|we own)\s+([A-Z][a-zA-Z&'\s]+?)(?=[,.]|(?:\s+Products\/services:)|$)/)
  if (named?.[1]) return named[1].trim().split(/\s+/).slice(0, 4).join(' ')

  const words = input.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)
  const stopWords = new Set(['i', 'sell', 'make', 'run', 'own', 'do', 'we', 'a', 'an', 'the', 'in', 'at', 'and', 'or', 'about', 'per', 'week', 'my', 'our', 'is', 'am', 'are', 'called', 'based'])
  const meaningful = words.filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
  const adjectives = ['Fresh', 'Pure', 'Local', 'Craft', 'Swift', 'Prime', 'True', 'Fine']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = meaningful[0]
    ? meaningful[0].charAt(0).toUpperCase() + meaningful[0].slice(1)
    : cat.tag.split(/\s+/)[0] || 'Business'
  return `${adj} ${noun}`
}

function promptField(input, label) {
  const pattern = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\.\\s*(?:Products\\/services|Target customer|What makes us different|Contact):|$)`, 'i')
  return input.match(pattern)?.[1]?.trim() || ''
}

function parseContact(input) {
  const contact = promptField(input, 'Contact') || input
  const email = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || ''
  const phone = contact.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0]?.trim() || ''
  return { email, phone }
}

function parseOfferings(input, cat) {
  const explicit = promptField(input, 'Products\\/services')
  const source = explicit || inferProductsFromHomepage(input) || cat.products.join(', ')
  const names = source
    .split(/,|\n| and /)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)

  while (names.length < 3) names.push(cat.products[names.length] || DEFAULT_CATEGORY.products[names.length])

  return names.map((item, i) => {
    const price = item.match(/(?:[$€£]\s?\d+(?:\.\d{2})?|\b(?:from|poa|contact us)\b[^,]*)/i)?.[0]?.trim()
    const name = item
      .replace(/(?:[$€£]\s?\d+(?:\.\d{2})?|\bfrom\b\s*[$€£]?\s?\d+(?:\.\d{2})?|\bpoa\b|\bcontact us\b)/ig, '')
      .trim()
      .replace(/\s{2,}/g, ' ')
    return {
      name: name || cat.products[i] || DEFAULT_CATEGORY.products[i],
      price: price || cat.prices[i] || 'Contact us',
      emoji: cat.emoji[i] || DEFAULT_CATEGORY.emoji[i],
      bg: cat.bgs[i] || DEFAULT_CATEGORY.bgs[i],
    }
  })
}

function inferProductsFromHomepage(input) {
  return input.match(/(?:sell|offer|provide|make|repair|serve|do)\s+([^,.]+)/i)?.[1]?.trim() || ''
}

function localExtract(input) {
  const lower = input.toLowerCase()
  const cat = CATEGORY_MAP.find((c) => c.keywords.some((k) => lower.includes(k))) || DEFAULT_CATEGORY
  const name = inferBusinessName(input, cat)
  const location = extractLocation(input)
  const volume = extractVolume(input)
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const products = parseOfferings(input, cat)
  const targetCustomers = promptField(input, 'Target customer') || 'local customers'
  const uniqueSellingPoint = promptField(input, 'What makes us different') || 'quality, consistency, and personal service'
  const { email, phone } = parseContact(input)

  return {
    name,
    tagline: `${name} — ${cat.tag} in ${location}`,
    tag: cat.tag,
    desc: `${name} is a ${cat.tag.toLowerCase()} based in ${location}, helping ${targetCustomers}. We stand out for ${uniqueSellingPoint}.`,
    location,
    slug,
    volume,
    unit: cat.unit,
    products,
    seoTitle: `${name} — ${cat.tag} in ${location}`,
    seoDesc: `Discover ${name} in ${location}. Quality ${cat.tag.toLowerCase()} with fast turnaround and great service.`,
    keywords: `${cat.tag.toLowerCase()} ${location}, local business, ${location} services`,
    about: `We are ${name}, a passionate ${cat.tag.toLowerCase()} serving ${location}. We help ${targetCustomers} with ${products.map((p) => p.name).join(', ')}. ${uniqueSellingPoint}.`,
    targetCustomers,
    uniqueSellingPoint,
    contactEmail: email,
    contactPhone: phone,
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
    targetCustomers: sc.targetCustomers || bd.targetCustomers || '',
    uniqueSellingPoint: sc.uniqueSellingPoint || bd.uniqueSellingPoint || '',
    contactEmail: sc.contactEmail || bd.contactEmail || bd.contactHint?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '',
    contactPhone: sc.contactPhone || bd.contactPhone || bd.contactHint?.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0]?.trim() || '',
    openHours: sc.openHours || bd.openHours || '',
    footerYear: sc.footerYear || String(new Date().getFullYear()),

    // Extra fields Div's site uses
    templateId: siteResult.templateId,
    styleTokens: siteResult.styleTokens,
    siteId: siteResult.siteId,
    sessionId: extractResult.sessionId,
    claimToken: extractResult.claimToken || siteResult.claimToken || null,
  }
}

// ─── Backend API path ─────────────────────────────────────────────────────────
async function backendExtract(conversationText, access) {
  // Step 1: Extract business data
  const extractRes = await apiRequest('/api/extract-business-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationText })
  }, access)

  if (!extractRes.ok) {
    throw await readApiError(extractRes, 'Business extraction failed')
  }

  const extractResult = await extractRes.json()

  // Step 2: Generate the full site
  const siteRes = await apiRequest('/api/generate-site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: extractResult.sessionId })
  }, { ...access, claimToken: extractResult.claimToken || access.claimToken })

  if (!siteRes.ok) {
    throw await readApiError(siteRes, 'Site generation failed')
  }

  const siteResult = await siteRes.json()

  // Map to Div's frontend data shape
  return mapBackendResponse(extractResult, siteResult)
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function extractBusinessData(input, access = {}) {
  try {
    return await backendExtract(input, access)
  } catch (err) {
    console.warn('Backend unavailable, using local fallback:', err.message)
    return localExtract(input)
  }
}

// Kept for compatibility with App.jsx
export function buildFallback(input) {
  return localExtract(input)
}
