import { describe, expect, it } from "vitest";
import { buildGeneratedSiteContent } from "../src/services/siteBuilder.js";
import { generateSeoMetadata } from "../src/services/seo.js";
import type { BusinessData } from "../src/schemas/business.js";
import { defaultTemplateSelection } from "../src/schemas/template.js";

const businessData: BusinessData = {
  businessName: "Flame & Craft",
  businessType: "Handmade Goods",
  productsOrServices: "Soy candles, gift bundles",
  location: "Melbourne",
  targetCustomers: "Gift buyers",
  uniqueSellingPoint: "Small-batch candles made locally",
  websiteVibe: "warm",
  extraFeatures: "",
  tagline: "Handmade candles in Melbourne",
  shortDescription: "Small-batch candles made in Melbourne.",
  contactHint: "",
  competitorReference: "",
  missingFields: [],
  confidence: "high"
};

describe("site builder", () => {
  it("builds frontend-compatible site content", () => {
    const seo = generateSeoMetadata(businessData);
    const site = buildGeneratedSiteContent(businessData, defaultTemplateSelection, seo);

    expect(site.name).toBe("Flame & Craft");
    expect(site.slug).toBe("flame-craft");
    expect(site.products).toHaveLength(3);
    expect(site.seoTitle).toContain("Flame & Craft");
  });
});
