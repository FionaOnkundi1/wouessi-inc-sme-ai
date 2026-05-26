import type { BusinessData } from "../schemas/business.js";
import type { TemplateSelection } from "../schemas/template.js";
import type { SeoMetadata } from "./seo.js";
import { slugify } from "../utils/slug.js";

export type GeneratedSiteContent = {
  name: string;
  tagline: string;
  tag: string;
  desc: string;
  location: string;
  slug: string;
  volume: string;
  unit: string;
  products: Array<{
    name: string;
    price: string;
    emoji: string;
    bg: string;
  }>;
  seoTitle: string;
  seoDesc: string;
  keywords: string;
  about: string;
  footerYear: string;
};

export function buildGeneratedSiteContent(
  businessData: BusinessData,
  templateSelection: TemplateSelection,
  seo: SeoMetadata
): GeneratedSiteContent {
  const products = buildProductCards(businessData.productsOrServices, templateSelection.colorPalette);

  return {
    name: businessData.businessName,
    tagline: businessData.tagline,
    tag: businessData.businessType,
    desc: businessData.shortDescription,
    location: businessData.location,
    slug: slugify(businessData.businessName),
    volume: "50",
    unit: inferUnit(businessData.businessType),
    products,
    seoTitle: seo.title,
    seoDesc: seo.description,
    keywords: seo.keywords.join(", "),
    about: buildAboutCopy(businessData),
    footerYear: String(new Date().getFullYear())
  };
}

function buildProductCards(productsOrServices: string, palette: TemplateSelection["colorPalette"]) {
  const names = productsOrServices
    .split(/,| and |\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  while (names.length < 3) {
    names.push(["Core Service", "Premium Option", "Custom Package"][names.length]);
  }

  const colorsByPalette: Record<TemplateSelection["colorPalette"], string[]> = {
    neutral: ["#f4f1ea", "#e6edf5", "#eef4ea"],
    "warm-earth": ["#faeeda", "#fbeaf0", "#e1f5ee"],
    "soft-pastel": ["#fbeaf0", "#e6f1fb", "#eaf3de"],
    "bold-contrast": ["#ffe36e", "#c8f169", "#87ceeb"],
    "clean-blue": ["#e6f1fb", "#edf7ff", "#e7f0ff"],
    "elegant-dark": ["#ece7df", "#d8dee9", "#e5e0ec"]
  };

  const emojis = ["⭐", "✨", "✓"];
  return names.map((name, index) => ({
    name,
    price: "Contact us",
    emoji: emojis[index],
    bg: colorsByPalette[palette][index]
  }));
}

function buildAboutCopy(businessData: BusinessData): string {
  return `${businessData.businessName} is a ${businessData.businessType.toLowerCase()} serving ${businessData.location}. ${businessData.uniqueSellingPoint}`;
}

function inferUnit(businessType: string): string {
  if (/repair/i.test(businessType)) return "repairs/week";
  if (/food|bakery|goods|jewellery|product/i.test(businessType)) return "orders/week";
  return "clients/week";
}
