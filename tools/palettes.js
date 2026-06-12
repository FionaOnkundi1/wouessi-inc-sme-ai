// palettes.js
// Maps style/vibe keywords to colour palettes.
// Each palette overrides the CSS variables in the template.
// Backend injects these as a <style> block at the top of the generated HTML.

export const PALETTES = {

  // ── RETAIL TEMPLATE PALETTES ──────────────────────────────────────
  retail: {
    default: {
      name: 'Warm Artisan',
      vars: {
        '--cream':   '#F7F3EE',
        '--warm':    '#EDE5D8',
        '--tan':     '#C9B99A',
        '--bark':    '#7A5C3A',
        '--char':    '#1E1A16',
        '--mid':     '#9A8A78',
      }
    },
    luxury: {
      name: 'Black & Gold',
      vars: {
        '--cream':   '#F8F6F0',
        '--warm':    '#EDE8DC',
        '--tan':     '#B8965A',
        '--bark':    '#B8965A',
        '--char':    '#111111',
        '--mid':     '#888888',
      }
    },
    minimal: {
      name: 'Cool Minimal',
      vars: {
        '--cream':   '#FAFAFA',
        '--warm':    '#F0F0F0',
        '--tan':     '#AAAAAA',
        '--bark':    '#333333',
        '--char':    '#111111',
        '--mid':     '#888888',
      }
    },
    bold: {
      name: 'Berry Bold',
      vars: {
        '--cream':   '#FDF5F8',
        '--warm':    '#F5E0EA',
        '--tan':     '#C4708A',
        '--bark':    '#8B2252',
        '--char':    '#1A0A12',
        '--mid':     '#9A7080',
      }
    },
    natural: {
      name: 'Forest Green',
      vars: {
        '--cream':   '#F3F7F0',
        '--warm':    '#E2EDD9',
        '--tan':     '#7AAB65',
        '--bark':    '#3D6B2A',
        '--char':    '#1A2415',
        '--mid':     '#7A907A',
      }
    },
    ocean: {
      name: 'Ocean Blue',
      vars: {
        '--cream':   '#F0F5FA',
        '--warm':    '#DDE8F5',
        '--tan':     '#6A9EC5',
        '--bark':    '#1E5F8A',
        '--char':    '#0E1E2E',
        '--mid':     '#6A8090',
      }
    },
    custom: {
      name: 'Custom',
      vars: {} // filled dynamically from brand colour input
    }
  },

  // ── TRADE TEMPLATE PALETTES ───────────────────────────────────────
  trade: {
    default: {
      name: 'Industrial Orange',
      vars: {
        '--bg':       '#0E1117',
        '--surface':  '#161B25',
        '--border':   '#1F2635',
        '--orange':   '#F05A28',
        '--orange-d': '#C44420',
        '--mid':      '#7A8098',
        '--dim':      '#3A4058',
      }
    },
    bold: {
      name: 'Electric Yellow',
      vars: {
        '--bg':       '#0D0D0D',
        '--surface':  '#1A1A1A',
        '--border':   '#2A2A2A',
        '--orange':   '#F5D800',
        '--orange-d': '#C4AC00',
        '--mid':      '#888888',
        '--dim':      '#444444',
      }
    },
    professional: {
      name: 'Navy Professional',
      vars: {
        '--bg':       '#0A0E18',
        '--surface':  '#131826',
        '--border':   '#1E2535',
        '--orange':   '#3A7BD5',
        '--orange-d': '#2A5BA5',
        '--mid':      '#7A8898',
        '--dim':      '#3A4555',
      }
    },
    green: {
      name: 'Safety Green',
      vars: {
        '--bg':       '#0A100A',
        '--surface':  '#121812',
        '--border':   '#1E2A1E',
        '--orange':   '#2ECC71',
        '--orange-d': '#27AE60',
        '--mid':      '#7A9888',
        '--dim':      '#3A5040',
      }
    },
    red: {
      name: 'Emergency Red',
      vars: {
        '--bg':       '#100A0A',
        '--surface':  '#1A1010',
        '--border':   '#2A1818',
        '--orange':   '#E53935',
        '--orange-d': '#B71C1C',
        '--mid':      '#988080',
        '--dim':      '#503838',
      }
    }
  },

  // ── HOSPITALITY TEMPLATE PALETTES ────────────────────────────────
  hospitality: {
    default: {
      name: 'Terracotta Warm',
      vars: {
        '--bg':          '#FDFAF5',
        '--warm':        '#F5EDE0',
        '--card':        '#FFFFFF',
        '--terracotta':  '#C4622D',
        '--terra-d':     '#9E4E24',
        '--green':       '#3D5A3E',
        '--char':        '#1C1810',
        '--mid':         '#7A6E60',
        '--light':       '#BFB5A8',
      }
    },
    modern: {
      name: 'Modern Café',
      vars: {
        '--bg':          '#F8F8F6',
        '--warm':        '#EFEFEB',
        '--card':        '#FFFFFF',
        '--terracotta':  '#1A1A1A',
        '--terra-d':     '#333333',
        '--green':       '#2D6A4F',
        '--char':        '#111111',
        '--mid':         '#777777',
        '--light':       '#CCCCCC',
      }
    },
    mediterranean: {
      name: 'Mediterranean',
      vars: {
        '--bg':          '#FDF8F0',
        '--warm':        '#F0E8D8',
        '--card':        '#FFFFFF',
        '--terracotta':  '#1A6B8A',
        '--terra-d':     '#145570',
        '--green':       '#C4622D',
        '--char':        '#1A1A2E',
        '--mid':         '#6A7A8A',
        '--light':       '#B0BEC5',
      }
    },
    vibrant: {
      name: 'Vibrant Fresh',
      vars: {
        '--bg':          '#FAFFF5',
        '--warm':        '#EDF7E0',
        '--card':        '#FFFFFF',
        '--terracotta':  '#2ECC71',
        '--terra-d':     '#27AE60',
        '--green':       '#E67E22',
        '--char':        '#1A2A1A',
        '--mid':         '#6A8A6A',
        '--light':       '#A8C8A8',
      }
    },
    dark: {
      name: 'Dark Bistro',
      vars: {
        '--bg':          '#0F0F0F',
        '--warm':        '#1A1A1A',
        '--card':        '#222222',
        '--terracotta':  '#D4A853',
        '--terra-d':     '#B8924A',
        '--green':       '#6B9E6B',
        '--char':        '#FFFFFF',
        '--mid':         '#AAAAAA',
        '--light':       '#555555',
      }
    }
  },

  // ── PROFESSIONAL TEMPLATE PALETTES ───────────────────────────────
  professional: {
    default: {
      name: 'Refined Gold',
      vars: {
        '--bg':      '#F9F9F7',
        '--white':   '#FFFFFF',
        '--ink':     '#111111',
        '--mid':     '#777777',
        '--light':   '#DDDDDD',
        '--accent':  '#1A1A2E',
        '--gold':    '#B8965A',
        '--surface': '#F2F2EF',
      }
    },
    luxury: {
      name: 'Pure Luxury',
      vars: {
        '--bg':      '#FAFAFA',
        '--white':   '#FFFFFF',
        '--ink':     '#0A0A0A',
        '--mid':     '#666666',
        '--light':   '#E0E0E0',
        '--accent':  '#0A0A0A',
        '--gold':    '#C9A84C',
        '--surface': '#F5F5F5',
      }
    },
    blue: {
      name: 'Corporate Blue',
      vars: {
        '--bg':      '#F5F7FA',
        '--white':   '#FFFFFF',
        '--ink':     '#0E1E3A',
        '--mid':     '#6A7A8A',
        '--light':   '#D5DCE8',
        '--accent':  '#0A1830',
        '--gold':    '#1E5FA5',
        '--surface': '#EEF2F8',
      }
    },
    green: {
      name: 'Sage Minimal',
      vars: {
        '--bg':      '#F5F7F5',
        '--white':   '#FFFFFF',
        '--ink':     '#1A2A1A',
        '--mid':     '#6A7A6A',
        '--light':   '#D5E0D5',
        '--accent':  '#1A2A1A',
        '--gold':    '#4A7A4A',
        '--surface': '#EEF3EE',
      }
    },
    dark: {
      name: 'Dark Editorial',
      vars: {
        '--bg':      '#111111',
        '--white':   '#F5F5F5',
        '--ink':     '#F5F5F5',
        '--mid':     '#888888',
        '--light':   '#333333',
        '--accent':  '#F5F5F5',
        '--gold':    '#D4A853',
        '--surface': '#1A1A1A',
      }
    }
  }
}

// ── STYLE KEYWORD → PALETTE MAPPING ──────────────────────────────────
// Used by AI extraction to auto-select a palette from the style preference answer

export const STYLE_MAP = {
  // Luxury / premium
  luxury:      { retail: 'luxury',       trade: 'professional', hospitality: 'dark',          professional: 'luxury' },
  premium:     { retail: 'luxury',       trade: 'professional', hospitality: 'dark',          professional: 'luxury' },
  elegant:     { retail: 'luxury',       trade: 'professional', hospitality: 'mediterranean', professional: 'luxury' },
  high_end:    { retail: 'luxury',       trade: 'professional', hospitality: 'dark',          professional: 'luxury' },

  // Minimal / clean
  minimal:     { retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'default' },
  clean:       { retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'default' },
  simple:      { retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'default' },
  modern:      { retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'blue' },

  // Bold / vibrant
  bold:        { retail: 'bold',         trade: 'bold',         hospitality: 'vibrant',       professional: 'default' },
  vibrant:     { retail: 'bold',         trade: 'bold',         hospitality: 'vibrant',       professional: 'default' },
  bright:      { retail: 'bold',         trade: 'bold',         hospitality: 'vibrant',       professional: 'default' },
  colourful:   { retail: 'bold',         trade: 'bold',         hospitality: 'vibrant',       professional: 'default' },

  // Warm / natural
  warm:        { retail: 'default',      trade: 'default',      hospitality: 'default',       professional: 'default' },
  natural:     { retail: 'natural',      trade: 'green',        hospitality: 'default',       professional: 'green' },
  earthy:      { retail: 'default',      trade: 'default',      hospitality: 'default',       professional: 'default' },
  organic:     { retail: 'natural',      trade: 'green',        hospitality: 'vibrant',       professional: 'green' },

  // Professional / corporate
  professional:{ retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'blue' },
  corporate:   { retail: 'minimal',      trade: 'professional', hospitality: 'modern',        professional: 'blue' },
  formal:      { retail: 'luxury',       trade: 'professional', hospitality: 'modern',        professional: 'blue' },

  // Dark / dramatic
  dark:        { retail: 'bold',         trade: 'default',      hospitality: 'dark',          professional: 'dark' },
  dramatic:    { retail: 'bold',         trade: 'red',          hospitality: 'dark',          professional: 'dark' },

  // Default fallback
  default:     { retail: 'default',      trade: 'default',      hospitality: 'default',       professional: 'default' },
}

/**
 * Get the palette for a given template and style preference string.
 * @param {string} template - 'retail' | 'trade' | 'hospitality' | 'professional'
 * @param {string} styleAnswer - raw style preference from user e.g. "warm and minimal"
 * @returns {object} palette object with { name, vars }
 */
export function getPalette(template, styleAnswer = '') {
  const lower = styleAnswer.toLowerCase()

  // Find first matching keyword
  const matchedKey = Object.keys(STYLE_MAP).find(k => lower.includes(k))
  const paletteKey = matchedKey
    ? STYLE_MAP[matchedKey][template]
    : 'default'

  return PALETTES[template]?.[paletteKey] || PALETTES[template]?.default
}

/**
 * Generate a <style> block to inject into the HTML template.
 * @param {object} palette - palette object with { vars }
 * @returns {string} CSS string
 */
export function generateCSSOverride(palette) {
  const vars = Object.entries(palette.vars)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join('\n')
  return `<style id="wouessi-palette">\n:root {\n${vars}\n}\n</style>`
}

/**
 * Apply a custom brand colour to a palette.
 * Converts the primary colour to lighter/darker variants automatically.
 * @param {string} template
 * @param {string} hexColor - e.g. '#5B3FE8'
 * @returns {object} palette object
 */
export function customPalette(template, hexColor) {
  const base = PALETTES[template]?.default
  if (!base) return null

  // Create a simple custom override using the brand colour as primary
  const custom = { ...base, vars: { ...base.vars } }

  // Each template uses a different variable name for its primary colour
  const primaryVarMap = {
    retail:       '--bark',
    trade:        '--orange',
    hospitality:  '--terracotta',
    professional: '--gold',
  }

  const primaryVar = primaryVarMap[template]
  if (primaryVar) {
    custom.vars[primaryVar] = hexColor
    custom.name = 'Custom Brand'
  }

  return custom
}
