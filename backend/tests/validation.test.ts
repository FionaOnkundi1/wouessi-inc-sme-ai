import { describe, expect, it } from "vitest";
import {
  regenerateSectionRequestSchema,
  submitAnswersSchema,
  updateSiteRequestSchema
} from "../src/schemas/api.js";
import { businessDataSchema } from "../src/schemas/business.js";

describe("request validation", () => {
  it("rejects an empty answer submission", () => {
    expect(() => submitAnswersSchema.parse({})).toThrow();
  });

  it("accepts checklist answers", () => {
    const parsed = submitAnswersSchema.parse({
      answers: {
        businessName: "Flame & Craft",
        services: "Handmade candles"
      }
    });

    expect(parsed.answers?.businessName).toBe("Flame & Craft");
  });

  it("rejects invalid business data confidence", () => {
    expect(() =>
      businessDataSchema.parse({
        businessName: "Test",
        businessType: "Bakery",
        productsOrServices: "Bread",
        location: "Melbourne",
        targetCustomers: "Local families",
        uniqueSellingPoint: "Fresh daily",
        websiteVibe: "warm",
        extraFeatures: "",
        tagline: "Fresh bread daily",
        shortDescription: "Fresh bread daily.",
        contactHint: "",
        missingFields: [],
        confidence: "certain"
      })
    ).toThrow();
  });

  it("accepts a section regeneration request", () => {
    const parsed = regenerateSectionRequestSchema.parse({
      siteId: "a2bde8ee-3777-4919-a861-47af4e812593",
      sectionId: "hero",
      answers: "[tagline] Reliable electrical help",
      siteData: { name: "BrightSpark Electrical" }
    });

    expect(parsed.sectionId).toBe("hero");
  });

  it("rejects an unknown section regeneration request", () => {
    expect(() =>
      regenerateSectionRequestSchema.parse({
        siteId: "a2bde8ee-3777-4919-a861-47af4e812593",
        sectionId: "unknown",
        answers: "Update this section",
        siteData: {}
      })
    ).toThrow();
  });

  it("accepts site content updates and rejects empty updates", () => {
    const parsed = updateSiteRequestSchema.parse({
      siteContent: { tagline: "Reliable electrical help" }
    });

    expect(parsed.siteContent.tagline).toBe("Reliable electrical help");
    expect(() => updateSiteRequestSchema.parse({ siteContent: {} })).toThrow();
  });
});
