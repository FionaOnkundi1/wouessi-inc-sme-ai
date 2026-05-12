import { describe, expect, it } from "vitest";
import { submitAnswersSchema } from "../src/schemas/api.js";
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
});
