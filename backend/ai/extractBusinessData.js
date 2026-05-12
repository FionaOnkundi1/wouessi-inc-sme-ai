import {
    extractionSystemPrompt,
    buildExtractionPrompt
  } from "./promptTemplate.js";
  
  import { validateBusinessData } from "./schema.js";
  
  import { groq } from "./client.js";
  
  export async function extractBusinessData(conversationText) {
    try {
      // Build user prompt
      const userPrompt = buildExtractionPrompt(conversationText);
  
      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: extractionSystemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ]
      });
  
      // Extract AI response text
      const aiText =
        completion.choices[0].message.content;
  
      console.log("=== RAW AI RESPONSE ===");
      console.log(aiText);
  
      // Parse JSON
      const parsedData = JSON.parse(aiText);
  
      // Validate schema
      const validation =
        validateBusinessData(parsedData);
  
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
  
      return {
        success: true,
        data: parsedData
      };
    } catch (error) {
      console.error("Extraction error:", error);
  
      return {
        success: false,
        errors: ["Failed to extract business data"]
      };
    }
  }