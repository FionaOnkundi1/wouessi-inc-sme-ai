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
      let mockAIResponse = {
        businessName: "",
        businessType: "",
        productsOrServices: "",
        location: "",
        targetCustomers: "",
        uniqueSellingPoint: "",
        websiteVibe: "",
        extraFeatures: "",
        tagline: "",
        shortDescription: "",
        contactHint: "",
        missingFields: [],
        confidence: "medium"
      };
      
      const lowerText = conversationText.toLowerCase();
      
      /**
       * Candle business
       */
      if (lowerText.includes("candle")) {
        mockAIResponse = {
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
      }
      
      /**
       * Car washing
       */
      else if (lowerText.includes("car washing")) {
        mockAIResponse = {
          businessName: "Sydney Mobile Car Wash",
          businessType: "Mobile car washing service",
          productsOrServices: "Mobile car washing",
          location: "Sydney",
          targetCustomers: "Busy car owners",
          uniqueSellingPoint: "Convenient mobile service",
          websiteVibe: "modern",
          extraFeatures: "",
          tagline: "Professional car washing at your location",
          shortDescription:
            "A Sydney mobile car wash helping busy car owners keep their vehicles clean conveniently.",
          contactHint: "",
          missingFields: ["businessName"],
          confidence: "high"
        };
      }
      
      /**
       * Cakes
       */
      else if (lowerText.includes("cake")) {
        mockAIResponse = {
          businessName: "Brisbane Cake Studio",
          businessType: "Cake business",
          productsOrServices: "Cakes",
          location: "Brisbane",
          targetCustomers: "",
          uniqueSellingPoint: "",
          websiteVibe: "warm",
          extraFeatures: "",
          tagline: "Fresh cakes for every celebration",
          shortDescription:
            "A Brisbane cake business creating cakes for special occasions.",
          contactHint: "",
          missingFields: [
            "targetCustomers",
            "uniqueSellingPoint"
          ],
          confidence: "medium"
        };
      }
      
      /**
       * Cleaning
       */
      else if (lowerText.includes("cleaning")) {
        mockAIResponse = {
          businessName: "Melbourne Flexible Cleaning",
          businessType: "Cleaning service",
          productsOrServices: "House and small office cleaning",
          location: "Melbourne",
          targetCustomers:
            "Homeowners and small office clients",
          uniqueSellingPoint:
            "Flexible and affordable cleaning",
          websiteVibe: "professional",
          extraFeatures: "",
          tagline: "Flexible cleaning for busy people",
          shortDescription:
            "A Melbourne cleaning service providing flexible and affordable cleaning solutions.",
          contactHint: "",
          missingFields: [],
          confidence: "high"
        };
      }
  
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