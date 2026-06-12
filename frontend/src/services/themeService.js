// src/services/themeService.js
// Maps Stefan's AI styleTokens + templateId to CSS variables on the React app.
// Called once when site data arrives from the backend.

// ── Colour palettes ───────────────────────────────────────────────────────────
const PALETTES = {
  'warm-earth': {
    '--site-primary':     '#7A4F3A',
    '--site-primary-d':   '#5A3A2A',
    '--site-accent':      '#C4622D',
    '--site-bg':          '#fffbf5',
    '--site-surface':     '#faeeda',
    '--site-surface-2':   '#fbeaf0',
    '--site-text':        '#2c1a0e',
    '--site-text-mid':    '#7a4f3a',
    '--site-text-light':  '#b07a5a',
    '--site-border':      '#f0d8c0',
    '--site-hero-from':   '#faeeda',
    '--site-hero-to':     '#fbeaf0',
    '--site-pill-bg':     '#e1f5ee',
    '--site-pill-text':   '#0F6E56',
    '--site-btn-bg':      '#2c1a0e',
    '--site-btn-text':    '#ffffff',
    '--site-btn-ghost':   '#2c1a0e',
    '--site-cta-bg':      '#2c1a0e',
    '--site-cta-text':    '#faeeda',
  },
  'bold-contrast': {
    '--site-primary':     '#F05A28',
    '--site-primary-d':   '#C44420',
    '--site-accent':      '#F05A28',
    '--site-bg':          '#0E1117',
    '--site-surface':     '#161B25',
    '--site-surface-2':   '#1F2635',
    '--site-text':        '#FFFFFF',
    '--site-text-mid':    '#7A8098',
    '--site-text-light':  '#4A5068',
    '--site-border':      '#1F2635',
    '--site-hero-from':   '#0E1117',
    '--site-hero-to':     '#161B25',
    '--site-pill-bg':     '#F05A28',
    '--site-pill-text':   '#FFFFFF',
    '--site-btn-bg':      '#F05A28',
    '--site-btn-text':    '#FFFFFF',
    '--site-btn-ghost':   '#FFFFFF',
    '--site-cta-bg':      '#F05A28',
    '--site-cta-text':    '#FFFFFF',
  },
  'neutral': {
    '--site-primary':     '#1a1a1a',
    '--site-primary-d':   '#333333',
    '--site-accent':      '#555555',
    '--site-bg':          '#ffffff',
    '--site-surface':     '#f5f5f0',
    '--site-surface-2':   '#eeece8',
    '--site-text':        '#1a1a1a',
    '--site-text-mid':    '#666666',
    '--site-text-light':  '#aaaaaa',
    '--site-border':      '#e8e6e0',
    '--site-hero-from':   '#f5f5f0',
    '--site-hero-to':     '#eeece8',
    '--site-pill-bg':     '#1a1a1a',
    '--site-pill-text':   '#ffffff',
    '--site-btn-bg':      '#1a1a1a',
    '--site-btn-text':    '#ffffff',
    '--site-btn-ghost':   '#1a1a1a',
    '--site-cta-bg':      '#1a1a1a',
    '--site-cta-text':    '#ffffff',
  },
  'soft-pastel': {
    '--site-primary':     '#8B2252',
    '--site-primary-d':   '#6B1A3E',
    '--site-accent':      '#C4708A',
    '--site-bg':          '#fdf5f8',
    '--site-surface':     '#fbeaf0',
    '--site-surface-2':   '#f5e0ea',
    '--site-text':        '#2a0a18',
    '--site-text-mid':    '#8B4060',
    '--site-text-light':  '#C4708A',
    '--site-border':      '#f0c8d8',
    '--site-hero-from':   '#fbeaf0',
    '--site-hero-to':     '#f5e0ea',
    '--site-pill-bg':     '#e1f5ee',
    '--site-pill-text':   '#0F6E56',
    '--site-btn-bg':      '#8B2252',
    '--site-btn-text':    '#ffffff',
    '--site-btn-ghost':   '#8B2252',
    '--site-cta-bg':      '#8B2252',
    '--site-cta-text':    '#fdf5f8',
  },
  'clean-blue': {
    '--site-primary':     '#185FA5',
    '--site-primary-d':   '#0C447C',
    '--site-accent':      '#378ADD',
    '--site-bg':          '#f5f8fc',
    '--site-surface':     '#e6f1fb',
    '--site-surface-2':   '#d0e4f5',
    '--site-text':        '#042C53',
    '--site-text-mid':    '#185FA5',
    '--site-text-light':  '#378ADD',
    '--site-border':      '#b5d4f4',
    '--site-hero-from':   '#e6f1fb',
    '--site-hero-to':     '#d0e4f5',
    '--site-pill-bg':     '#185FA5',
    '--site-pill-text':   '#ffffff',
    '--site-btn-bg':      '#185FA5',
    '--site-btn-text':    '#ffffff',
    '--site-btn-ghost':   '#185FA5',
    '--site-cta-bg':      '#042C53',
    '--site-cta-text':    '#e6f1fb',
  },
  'elegant-dark': {
    '--site-primary':     '#B8965A',
    '--site-primary-d':   '#8A7040',
    '--site-accent':      '#D4A853',
    '--site-bg':          '#111111',
    '--site-surface':     '#1A1A1A',
    '--site-surface-2':   '#222222',
    '--site-text':        '#F5F5F0',
    '--site-text-mid':    '#AAAAAA',
    '--site-text-light':  '#666666',
    '--site-border':      '#333333',
    '--site-hero-from':   '#111111',
    '--site-hero-to':     '#1A1A1A',
    '--site-pill-bg':     '#B8965A',
    '--site-pill-text':   '#111111',
    '--site-btn-bg':      '#B8965A',
    '--site-btn-text':    '#111111',
    '--site-btn-ghost':   '#F5F5F0',
    '--site-cta-bg':      '#B8965A',
    '--site-cta-text':    '#111111',
  },
}

// ── Font pairings ─────────────────────────────────────────────────────────────
const FONTS = {
  'modern-sans': {
    '--site-font-sans':    "'Inter', sans-serif",
    '--site-font-display': "'Inter', sans-serif",
    '--site-font-weight-display': '700',
    '--site-letter-spacing': '0',
  },
  'friendly-rounded': {
    '--site-font-sans':    "'Nunito', 'Inter', sans-serif",
    '--site-font-display': "'Nunito', 'Inter', sans-serif",
    '--site-font-weight-display': '800',
    '--site-letter-spacing': '0.01em',
  },
  'elegant-serif': {
    '--site-font-sans':    "'Inter', sans-serif",
    '--site-font-display': "'Georgia', serif",
    '--site-font-weight-display': '400',
    '--site-letter-spacing': '0.02em',
  },
  'bold-display': {
    '--site-font-sans':    "'Inter', sans-serif",
    '--site-font-display': "'Inter', sans-serif",
    '--site-font-weight-display': '900',
    '--site-letter-spacing': '0.05em',
  },
}

// ── Template to business tag mapping ─────────────────────────────────────────
// Maps Stefan's templateId to the HTML template name for reference
// and sets a data attribute on <body> for CSS targeting if needed
const TEMPLATE_MAP = {
  'warm-template':        { bodyClass: 'theme-warm',        htmlTemplate: 'template-retail' },
  'bold-template':        { bodyClass: 'theme-bold',        htmlTemplate: 'template-trade' },
  'minimal-template':     { bodyClass: 'theme-minimal',     htmlTemplate: 'template-professional' },
}

// ── Fallback palette based on business tag ────────────────────────────────────
function inferPaletteFromTag(tag) {
  const lower = (tag || '').toLowerCase()
  if (/trade|plumb|electri|build|construct|repair/i.test(lower)) return 'bold-contrast'
  if (/candle|beauty|food|bake|organic|wellness|handmade/i.test(lower)) return 'warm-earth'
  if (/photo|design|creative|art|studio/i.test(lower)) return 'soft-pastel'
  if (/law|consult|finance|account|profession/i.test(lower)) return 'elegant-dark'
  if (/tech|software|digital|data/i.test(lower)) return 'clean-blue'
  return 'neutral'
}

// ── Main apply function ───────────────────────────────────────────────────────
export function applyTheme(siteData) {
  const { styleTokens, templateId, tag } = siteData

  // Force bold theme for trade businesses regardless of AI selection
  const isTradie = /trade|plumb|electri|build|construct|repair|clean|landscape|paint|weld/i.test(tag || '')

  // Resolve palette — use AI selection or infer from business tag
  const paletteKey = styleTokens?.colorPalette || inferPaletteFromTag(tag)
  const fontKey = styleTokens?.fontPairing || 'modern-sans'
  const template = TEMPLATE_MAP[templateId] || TEMPLATE_MAP['minimal-template']

  const palette = PALETTES[paletteKey] || PALETTES['neutral']
  const font = FONTS[fontKey] || FONTS['modern-sans']

  // Apply all CSS variables to :root
  const root = document.documentElement
  Object.entries({ ...palette, ...font }).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Set body class for template-level CSS targeting
  document.body.className = template.bodyClass

  // Store template name for reference
  root.setAttribute('data-template', templateId || 'minimal-template')
  root.setAttribute('data-palette', paletteKey)
}

// ── Reset to defaults ─────────────────────────────────────────────────────────
export function resetTheme() {
  const root = document.documentElement
  const allVars = Object.keys(PALETTES['neutral']).concat(Object.keys(FONTS['modern-sans']))
  allVars.forEach(key => root.style.removeProperty(key))
  document.body.className = ''
  root.removeAttribute('data-template')
  root.removeAttribute('data-palette')
}
