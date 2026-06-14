const PAGE_TITLES = {
  home: "Home",
  products: "Products & Services",
  about: "About",
  contact: "Contact"
};

export async function fetchPublishedSite(slug) {
  const response = await fetch(publicApiUrl(slug), {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Published website request failed with status ${response.status}.`);
  }

  return response.json();
}

export function publicApiUrl(slug) {
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:4000";
  return `${stripTrailingSlash(apiBaseUrl)}/api/public/sites/${encodeURIComponent(slug)}`;
}

export function sitePath(slug, page = "home") {
  const suffix = page === "home" ? "" : `/${page}`;
  return `/sites/${encodeURIComponent(slug)}${suffix}`;
}

export function resolvePage(parts) {
  if (!parts || parts.length === 0) return "home";
  if (parts.length !== 1) return null;
  return Object.hasOwn(PAGE_TITLES, parts[0]) ? parts[0] : null;
}

export function buildSiteMetadata(site, page) {
  const content = site.siteContent || {};
  const seo = site.seo || {};
  const businessName = content.name || "Published website";
  const baseTitle = seo.title || content.seoTitle || businessName;
  const title = page === "home" ? baseTitle : `${PAGE_TITLES[page]} | ${businessName}`;
  const description = seo.description || content.seoDesc || content.desc || "";
  const keywords = Array.isArray(seo.keywords)
    ? seo.keywords
    : String(content.keywords || "").split(",").map((value) => value.trim()).filter(Boolean);
  const canonical = site.publicUrl
    ? `${stripTrailingSlash(site.publicUrl)}${page === "home" ? "" : `/${page}`}`
    : sitePath(site.slug, page);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: businessName,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: `${businessName} website`
        }
      ]
    }
  };
}

export function siteTheme(styleTokens = {}) {
  const palette = PALETTES[styleTokens.colorPalette] || PALETTES.neutral;
  const font = DISPLAY_FONTS[styleTokens.fontPairing] || DISPLAY_FONTS["modern-sans"];

  return {
    ...palette,
    ...font
  };
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

const DISPLAY_FONTS = {
  "modern-sans": {
    "--site-font-sans": "Inter, Arial, sans-serif",
    "--site-font-display": "Inter, Arial, sans-serif",
    "--site-font-weight-display": "700",
    "--site-letter-spacing": "0"
  },
  "friendly-rounded": {
    "--site-font-sans": "Nunito, Inter, Arial, sans-serif",
    "--site-font-display": "Nunito, Inter, Arial, sans-serif",
    "--site-font-weight-display": "800",
    "--site-letter-spacing": "0.01em"
  },
  "elegant-serif": {
    "--site-font-sans": "Inter, Arial, sans-serif",
    "--site-font-display": "Georgia, serif",
    "--site-font-weight-display": "400",
    "--site-letter-spacing": "0.02em"
  },
  "bold-display": {
    "--site-font-sans": "Inter, Arial, sans-serif",
    "--site-font-display": "Inter, Arial, sans-serif",
    "--site-font-weight-display": "900",
    "--site-letter-spacing": "0.05em"
  }
};

const PALETTES = {
  neutral: {
    "--site-primary": "#1a1a1a",
    "--site-primary-d": "#333333",
    "--site-accent": "#555555",
    "--site-bg": "#ffffff",
    "--site-surface": "#f5f5f0",
    "--site-surface-2": "#eeece8",
    "--site-text": "#1a1a1a",
    "--site-text-mid": "#666666",
    "--site-text-light": "#aaaaaa",
    "--site-border": "#e8e6e0",
    "--site-hero-from": "#f5f5f0",
    "--site-hero-to": "#eeece8",
    "--site-pill-bg": "#1a1a1a",
    "--site-pill-text": "#ffffff",
    "--site-btn-bg": "#1a1a1a",
    "--site-btn-text": "#ffffff",
    "--site-btn-ghost": "#1a1a1a",
    "--site-cta-bg": "#1a1a1a",
    "--site-cta-text": "#ffffff"
  },
  "warm-earth": {
    "--site-primary": "#7A4F3A",
    "--site-primary-d": "#5A3A2A",
    "--site-accent": "#C4622D",
    "--site-bg": "#fffbf5",
    "--site-surface": "#faeeda",
    "--site-surface-2": "#fbeaf0",
    "--site-text": "#2c1a0e",
    "--site-text-mid": "#7a4f3a",
    "--site-text-light": "#b07a5a",
    "--site-border": "#f0d8c0",
    "--site-hero-from": "#faeeda",
    "--site-hero-to": "#fbeaf0",
    "--site-pill-bg": "#e1f5ee",
    "--site-pill-text": "#0F6E56",
    "--site-btn-bg": "#2c1a0e",
    "--site-btn-text": "#ffffff",
    "--site-btn-ghost": "#2c1a0e",
    "--site-cta-bg": "#2c1a0e",
    "--site-cta-text": "#faeeda"
  },
  "soft-pastel": {
    "--site-primary": "#8B2252",
    "--site-primary-d": "#6B1A3E",
    "--site-accent": "#C4708A",
    "--site-bg": "#fdf5f8",
    "--site-surface": "#fbeaf0",
    "--site-surface-2": "#f5e0ea",
    "--site-text": "#2a0a18",
    "--site-text-mid": "#8B4060",
    "--site-text-light": "#C4708A",
    "--site-border": "#f0c8d8",
    "--site-hero-from": "#fbeaf0",
    "--site-hero-to": "#f5e0ea",
    "--site-pill-bg": "#e1f5ee",
    "--site-pill-text": "#0F6E56",
    "--site-btn-bg": "#8B2252",
    "--site-btn-text": "#ffffff",
    "--site-btn-ghost": "#8B2252",
    "--site-cta-bg": "#8B2252",
    "--site-cta-text": "#fdf5f8"
  },
  "bold-contrast": {
    "--site-primary": "#F05A28",
    "--site-primary-d": "#C44420",
    "--site-accent": "#F05A28",
    "--site-bg": "#0E1117",
    "--site-surface": "#161B25",
    "--site-surface-2": "#1F2635",
    "--site-text": "#FFFFFF",
    "--site-text-mid": "#7A8098",
    "--site-text-light": "#4A5068",
    "--site-border": "#1F2635",
    "--site-hero-from": "#0E1117",
    "--site-hero-to": "#161B25",
    "--site-pill-bg": "#F05A28",
    "--site-pill-text": "#FFFFFF",
    "--site-btn-bg": "#F05A28",
    "--site-btn-text": "#FFFFFF",
    "--site-btn-ghost": "#FFFFFF",
    "--site-cta-bg": "#F05A28",
    "--site-cta-text": "#FFFFFF"
  },
  "clean-blue": {
    "--site-primary": "#185FA5",
    "--site-primary-d": "#0C447C",
    "--site-accent": "#378ADD",
    "--site-bg": "#f5f8fc",
    "--site-surface": "#e6f1fb",
    "--site-surface-2": "#d0e4f5",
    "--site-text": "#042C53",
    "--site-text-mid": "#185FA5",
    "--site-text-light": "#378ADD",
    "--site-border": "#b5d4f4",
    "--site-hero-from": "#e6f1fb",
    "--site-hero-to": "#d0e4f5",
    "--site-pill-bg": "#185FA5",
    "--site-pill-text": "#ffffff",
    "--site-btn-bg": "#185FA5",
    "--site-btn-text": "#ffffff",
    "--site-btn-ghost": "#185FA5",
    "--site-cta-bg": "#042C53",
    "--site-cta-text": "#e6f1fb"
  },
  "elegant-dark": {
    "--site-primary": "#B8965A",
    "--site-primary-d": "#8A7040",
    "--site-accent": "#D4A853",
    "--site-bg": "#111111",
    "--site-surface": "#1A1A1A",
    "--site-surface-2": "#222222",
    "--site-text": "#F5F5F0",
    "--site-text-mid": "#AAAAAA",
    "--site-text-light": "#666666",
    "--site-border": "#333333",
    "--site-hero-from": "#111111",
    "--site-hero-to": "#1A1A1A",
    "--site-pill-bg": "#B8965A",
    "--site-pill-text": "#111111",
    "--site-btn-bg": "#B8965A",
    "--site-btn-text": "#111111",
    "--site-btn-ghost": "#F5F5F0",
    "--site-cta-bg": "#B8965A",
    "--site-cta-text": "#111111"
  }
};
