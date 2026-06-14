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
  targetCustomers: string;
  uniqueSellingPoint: string;
  contactEmail: string;
  contactPhone: string;
  openHours: string;
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
    targetCustomers: businessData.targetCustomers,
    uniqueSellingPoint: businessData.uniqueSellingPoint,
    contactEmail: extractEmail(businessData.contactHint),
    contactPhone: extractPhone(businessData.contactHint),
    openHours: extractOpenHours(businessData.contactHint),
    footerYear: String(new Date().getFullYear())
  };
}

function buildProductCards(productsOrServices: string, palette: TemplateSelection["colorPalette"]) {
  const names = productsOrServices
    .split(/,| and |\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

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
  return names.map((item, index) => ({
    name: cleanOfferingName(item) || ["Core Service", "Premium Option", "Custom Package"][index],
    price: extractPrice(item) || "Contact us",
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

function extractEmail(value: string): string {
  return value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
}

function extractPhone(value: string): string {
  return value.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0]?.trim() || "";
}

function extractPrice(value: string): string {
  return value.match(/(?:[$€£]\s?\d+(?:\.\d{2})?|\bfrom\b\s*[$€£]?\s?\d+(?:\.\d{2})?|\bpoa\b|\bcontact us\b)/i)?.[0]?.trim() || "";
}

function extractOpenHours(value: string): string {
  const labelled = value.match(/(?:opening hours|open hours|hours)\s*(?::|are|is)?\s*([^.;]+(?:[.;]\s*[^.;]*(?:after hours|emergency)[^.;]*)?)/i)?.[1];
  const dayPattern = value.match(/((?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.;]*(?:am|pm)[^.;]*(?:after hours|emergency[^.;]*)?)/i)?.[1];
  return cleanOpenHours(labelled || dayPattern || "");
}

function cleanOpenHours(value: string): string {
  return value.replace(/^(?:are|is|:|-)\s+/i, "").trim();
}

function cleanOfferingName(value: string): string {
  return value
    .replace(/(?:[$€£]\s?\d+(?:\.\d{2})?|\bfrom\b\s*[$€£]?\s?\d+(?:\.\d{2})?|\bpoa\b|\bcontact us\b)/ig, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}
