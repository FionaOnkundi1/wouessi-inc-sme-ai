import { env } from "../../config/env.js";
import {
  defaultTemplateSelection,
  templateSelectionSchema,
  type TemplateSelection
} from "../../schemas/template.js";
import type { BusinessData } from "../../schemas/business.js";
import { getGroqClient } from "./client.js";
import { parseJsonObject } from "./json.js";
import { templateSelectionSystemPrompt } from "./prompts.js";

export async function selectTemplateAndStyle(
  businessData: BusinessData
): Promise<{ success: boolean; data: TemplateSelection; source: "groq" | "fallback"; errors?: string[] }> {
  const groq = getGroqClient();
  if (!groq) {
    return {
      success: true,
      data: fallbackTemplateSelection(businessData),
      source: "fallback",
      errors: ["GROQ_API_KEY is not configured; fallback template selection was used."]
    };
  }

  const errors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: templateSelectionSystemPrompt },
          {
            role: "user",
            content: `Select the best template and style tokens for this business data:\n\n${JSON.stringify(
              businessData,
              null,
              2
            )}\n\nReturn ONLY valid JSON.`
          }
        ]
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      return {
        success: true,
        data: templateSelectionSchema.parse(parseJsonObject(raw)),
        source: "groq"
      };
    } catch (error) {
      errors.push(`Attempt ${attempt}: ${String(error)}`);
    }
  }

  return {
    success: true,
    data: fallbackTemplateSelection(businessData),
    source: "fallback",
    errors
  };
}

export function fallbackTemplateSelection(businessData: BusinessData): TemplateSelection {
  if (businessData.websiteVibe === "warm" || /food|beauty|wellness|handmade/i.test(businessData.businessType)) {
    return {
      selectedTemplate: "warm-template",
      colorPalette: "warm-earth",
      fontPairing: "friendly-rounded",
      sectionEmphasis: "trust-focused",
      reason: "Warm local businesses benefit from friendly colors and trust-led sections."
    };
  }

  if (businessData.websiteVibe === "bold" || businessData.websiteVibe === "playful") {
    return {
      selectedTemplate: "bold-template",
      colorPalette: "bold-contrast",
      fontPairing: "bold-display",
      sectionEmphasis: "visual-focused",
      reason: "High-energy businesses benefit from stronger visual contrast."
    };
  }

  return defaultTemplateSelection;
}
