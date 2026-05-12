import { env } from "../../config/env.js";
import { businessDataSchema, type BusinessData } from "../../schemas/business.js";
import { getGroqClient } from "./client.js";
import { buildExtractionPrompt, extractionSystemPrompt } from "./prompts.js";
import { parseJsonObject } from "./json.js";

export type AiResult<T> = {
  success: boolean;
  data: T;
  source: "groq" | "fallback";
  errors?: string[];
};

export async function extractBusinessData(
  conversationText: string
): Promise<AiResult<BusinessData>> {
  const groq = getGroqClient();
  if (!groq) {
    return {
      success: true,
      data: buildFallbackBusinessData(conversationText),
      source: "fallback",
      errors: ["GROQ_API_KEY is not configured; fallback extraction was used."]
    };
  }

  const errors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: extractionSystemPrompt },
          { role: "user", content: buildExtractionPrompt(conversationText) }
        ]
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = businessDataSchema.parse(parseJsonObject(raw));

      return {
        success: true,
        data: parsed,
        source: "groq"
      };
    } catch (error) {
      errors.push(`Attempt ${attempt}: ${String(error)}`);
    }
  }

  return {
    success: true,
    data: buildFallbackBusinessData(conversationText),
    source: "fallback",
    errors
  };
}

export function buildFallbackBusinessData(conversationText: string): BusinessData {
  const lower = conversationText.toLowerCase();
  const location = inferLocation(conversationText);
  const businessType = inferBusinessType(lower);
  const businessName = inferBusinessName(conversationText, businessType);
  const productsOrServices = inferProductsOrServices(conversationText, businessType);
  const websiteVibe = inferVibe(lower);

  return {
    businessName,
    businessType,
    productsOrServices,
    location,
    targetCustomers: "Local customers looking for reliable small business services",
    uniqueSellingPoint: "Quality service, personal attention, and fast communication",
    websiteVibe,
    extraFeatures: "",
    tagline: `${businessType} in ${location}`,
    shortDescription: `${businessName} helps local customers with ${productsOrServices.toLowerCase()}. We focus on friendly service, clear communication, and dependable results.`,
    contactHint: "",
    missingFields: ["phone number", "email address"],
    confidence: conversationText.trim().length > 80 ? "medium" : "low"
  };
}

function inferBusinessType(lower: string): string {
  if (lower.includes("candle")) return "Handmade Goods";
  if (lower.includes("tailor") || lower.includes("alteration")) return "Fashion & Tailoring";
  if (lower.includes("vegetable") || lower.includes("fruit") || lower.includes("organic")) return "Organic Food";
  if (lower.includes("phone") || lower.includes("repair")) return "Tech Repair";
  if (lower.includes("bake") || lower.includes("cake") || lower.includes("bread")) return "Bakery";
  if (lower.includes("hair") || lower.includes("beauty") || lower.includes("salon")) return "Beauty & Wellness";
  return "Small Business";
}

function inferProductsOrServices(text: string, businessType: string): string {
  const afterOffer = text.match(/(?:sell|offer|provide|do|make|repair)\s+([^,.]+)/i);
  if (afterOffer?.[1]) return afterOffer[1].trim();
  return businessType === "Small Business" ? "Products and services" : businessType;
}

function inferLocation(text: string): string {
  const match = text.match(/\b(?:in|based in|located in|serving)\s+([A-Z][a-zA-Z\s]+?)(?:[,.]|$)/i);
  if (!match?.[1]) return "Local Area";
  return match[1].trim().split(/\s+/).slice(0, 3).join(" ");
}

function inferBusinessName(text: string, businessType: string): string {
  const named = text.match(/\b(?:business name is|called|we are|i run)\s+([A-Z][a-zA-Z&'\s]+?)(?:[,.]|$)/i);
  if (named?.[1]) return named[1].trim().split(/\s+/).slice(0, 4).join(" ");

  const noun = businessType.split(/\s+/)[0] ?? "Business";
  return `Local ${noun}`;
}

function inferVibe(lower: string): BusinessData["websiteVibe"] {
  if (lower.includes("luxury") || lower.includes("premium")) return "professional";
  if (lower.includes("warm") || lower.includes("friendly")) return "warm";
  if (lower.includes("bold")) return "bold";
  if (lower.includes("playful")) return "playful";
  if (lower.includes("minimal") || lower.includes("simple")) return "minimal";
  return "modern";
}
