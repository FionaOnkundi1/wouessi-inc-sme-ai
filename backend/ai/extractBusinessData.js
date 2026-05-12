import {
    extractionSystemPrompt,
    buildExtractionPrompt
  } from "./promptTemplate.js";
  
  import { validateBusinessData } from "./schema.js";
  
  /**
   * Simulated AI extraction function
   * Later this will connect to Groq / OpenAI / Gemini
   */
  export async function extractBusinessData(conversationText) {
    try {
      // Build final prompt
      const userPrompt = buildExtractionPrompt(conversationText);
  
      console.log("=== SYSTEM PROMPT ===");
      console.log(extractionSystemPrompt);
  
      console.log("=== USER PROMPT ===");
      console.log(userPrompt);
  
      /**
       * TEMP MOCK RESPONSE
       * Replace later with real LLM API call
       */
      const mockAIResponse = {
        businessName: "Melbourne Handmade Candles",
        businessType: "Handmade candle business",
        productsOrServices: "Handmade candles",
        location: "Melbourne",
        targetCustomers: "Gift and home decoration customers",
        uniqueSellingPoint: "All candles are handmade personally",
        websiteVibe: "warm",
        extraFeatures: "",
        tagline: "Handmade candles for warm spaces",
        shortDescription:
          "A Melbourne-based handmade candle business creating warm and thoughtful products.",
        contactHint: "",
        missingFields: [],
        confidence: "high"
      };
  
      // Validate AI output
      const validation = validateBusinessData(mockAIResponse);
  
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
  
      return {
        success: true,
        data: mockAIResponse
      };
    } catch (error) {
      console.error("Extraction error:", error);
  
      return {
        success: false,
        errors: ["Failed to extract business data"]
      };
    }
  }