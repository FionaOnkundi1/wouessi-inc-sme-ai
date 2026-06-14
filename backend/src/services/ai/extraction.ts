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
  const targetCustomers = promptField(conversationText, "Target customer")
    || extractSection(conversationText, ["typical customers", "customers are", "customers"])
    || "Local customers looking for reliable small business services";
  const uniqueSellingPoint = promptField(conversationText, "What makes us different")
    || extractSection(conversationText, ["what makes us different", "different is", "choose us because"])
    || "Quality service, personal attention, and fast communication";
  const contactHint = [
    promptField(conversationText, "Contact"),
    extractSection(conversationText, ["contact email", "email"]),
    extractSection(conversationText, ["phone"]),
    extractSection(conversationText, ["opening hours", "open hours", "hours"])
  ].filter(Boolean).join(". ");
  const websiteVibe = inferVibe(lower);

  return {
    businessName,
    businessType,
    productsOrServices,
    location,
    targetCustomers,
    uniqueSellingPoint,
    websiteVibe,
    extraFeatures: "",
    tagline: `${businessName} - ${businessType} in ${location}`,
    shortDescription: `${businessName} helps ${targetCustomers.toLowerCase()} with ${productsOrServices.toLowerCase()}. We stand out for ${uniqueSellingPoint.toLowerCase()}.`,
    contactHint,
    competitorReference: "",
    missingFields: contactHint ? [] : ["phone number", "email address"],
    confidence: conversationText.trim().length > 80 ? "medium" : "low"
  };
}

function inferBusinessType(lower: string): string {
  if (lower.includes("plumb") || lower.includes("electric") || lower.includes("trade") || lower.includes("burst pipe") || lower.includes("blocked drain")) return "Trade Services";
  if (lower.includes("clean")) return "Cleaning Services";
  if (lower.includes("bake") || lower.includes("bakery") || lower.includes("cake") || lower.includes("bread") || lower.includes("croissant")) return "Bakery";
  if (lower.includes("candle")) return "Handmade Goods";
  if (lower.includes("tailor") || lower.includes("alteration")) return "Fashion & Tailoring";
  if (lower.includes("vegetable") || lower.includes("fruit") || lower.includes("organic")) return "Organic Food";
  if (lower.includes("phone") || lower.includes("repair")) return "Tech Repair";
  if (lower.includes("hair") || lower.includes("beauty") || lower.includes("salon")) return "Beauty & Wellness";
  return "Small Business";
}

function inferProductsOrServices(text: string, businessType: string): string {
  const productsAnswer = promptField(text, "Products/services");
  if (productsAnswer) return productsAnswer;

  const detailedOffer = extractSection(text, [
    "we provide",
    "we offer",
    "i provide",
    "i offer",
    "we sell",
    "i sell",
    "we do",
    "i do"
  ]);
  if (detailedOffer) return detailedOffer;

  return businessType === "Small Business" ? "Products and services" : businessType;
}

function inferLocation(text: string): string {
  const match = text.match(/\b(?:based in|located in|serving|around|in)\s+([A-Z][a-zA-Z\s]+?)(?=\s+(?:called|named)|[,.]|$)/i);
  if (!match?.[1]) return "Local Area";
  return cleanLocation(match[1]);
}

function inferBusinessName(text: string, businessType: string): string {
  const named = text.match(/\b(?:business name is|called|named|we are|i run|we run|i own|we own)\s+([A-Z][a-zA-Z&'\s]+?)(?=[,.]|(?:\s+Products\/services:)|$)/i);
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

function promptField(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(
    new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=\\.\\s*(?:Products\\/services|Target customer|What makes us different|Contact):|$)`, "i")
  );
  return match?.[1]?.trim() || "";
}

function extractSection(text: string, starts: string[]): string {
  for (const start of starts) {
    const pattern = new RegExp(
      `${start}\\s*(?::|is|are)?\\s+([\\s\\S]*?)(?=\\n|\\.\\s+(?:We complete|Our typical|Our customers|What makes|We want|The main goal|Contact|Phone|Opening hours|Open hours|Emergency call-outs|$)|$)`,
      "i"
    );
    const match = text.match(pattern);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return "";
}

function cleanLocation(value: string): string {
  return value
    .replace(/\b(called|named|products|services|target|customer|contact)\b.*$/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ") || "Local Area";
}
