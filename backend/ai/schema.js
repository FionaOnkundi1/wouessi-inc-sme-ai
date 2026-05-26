export const allowedWebsiteVibes = [
    "modern",
    "warm",
    "bold",
    "minimal",
    "professional",
    "playful"
  ];
  
  export const requiredBusinessFields = [
    "businessName",
    "businessType",
    "productsOrServices",
    "location",
    "targetCustomers",
    "uniqueSellingPoint",
    "websiteVibe",
    "extraFeatures",
    "tagline",
    "shortDescription",
    "contactHint",
    "missingFields",
    "confidence"
  ];
  
  export function validateBusinessData(data) {
    const errors = [];
  
    for (const field of requiredBusinessFields) {
      if (!(field in data)) {
        errors.push(`Missing field: ${field}`);
      }
    }
  
    if (
      data.websiteVibe &&
      !allowedWebsiteVibes.includes(data.websiteVibe)
    ) {
      errors.push(`Invalid websiteVibe: ${data.websiteVibe}`);
    }
  
    if (
      data.confidence &&
      !["high", "medium", "low"].includes(data.confidence)
    ) {
      errors.push(`Invalid confidence: ${data.confidence}`);
    }
  
    if (!Array.isArray(data.missingFields)) {
      errors.push("missingFields must be an array");
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }