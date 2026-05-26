import { selectTemplateAndStyle } from "./templateSelection.js";

const sampleBusinessData = {
  businessName: "Melbourne Candle Studio",
  businessType: "Handmade Candles",
  productsOrServices: "Handmade Candles",
  location: "Melbourne",
  targetCustomers: "People buying gifts or home decoration",
  uniqueSellingPoint: "Handmade by the owner",
  websiteVibe: "warm",
  extraFeatures: "",
  tagline: "Illuminate your space with love and care",
  shortDescription:
    "Handmade candles crafted with love and care, perfect for gifting or decorating your home.",
  contactHint: "",
  missingFields: ["phone number", "email address"],
  confidence: "medium"
};

const result = await selectTemplateAndStyle(sampleBusinessData);

console.log("=== TEMPLATE SELECTION RESULT ===");
console.log(JSON.stringify(result, null, 2));