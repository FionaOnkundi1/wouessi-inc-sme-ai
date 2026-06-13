import { z } from "zod";
import { env } from "../../config/env.js";
import { getGroqClient } from "./client.js";
import { parseJsonObject } from "./json.js";
import type { AiResult } from "./extraction.js";

export const sectionIds = [
  "hero",
  "features",
  "testimonials",
  "products",
  "about",
  "values",
  "faq",
  "contact",
  "seo"
] as const;

export type SectionId = (typeof sectionIds)[number];
type SiteData = Record<string, unknown>;

const iconContentSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1)
});

const sectionPatchSchemas = {
  hero: z.object({
    tagline: z.string().min(1),
    desc: z.string().min(1)
  }),
  features: z.object({
    features: z.array(iconContentSchema).min(1).max(4)
  }),
  testimonials: z.object({
    testimonials: z.array(z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      text: z.string().min(1),
      rating: z.number().int().min(1).max(5)
    })).min(1).max(3)
  }),
  products: z.object({
    products: z.array(z.object({
      name: z.string().min(1),
      price: z.string(),
      emoji: z.string().min(1),
      bg: z.string().regex(/^#[0-9a-f]{6}$/i)
    })).min(1).max(3)
  }),
  about: z.object({
    about: z.string().min(1),
    volume: z.string().min(1),
    unit: z.string().min(1)
  }),
  values: z.object({
    values: z.array(iconContentSchema).min(1).max(3)
  }),
  faq: z.object({
    faq: z.array(z.object({
      q: z.string().min(1),
      a: z.string().min(1)
    })).min(1).max(4)
  }),
  contact: z.object({
    location: z.string().min(1),
    contactEmail: z.string().email().or(z.literal("")),
    contactPhone: z.string(),
    openHours: z.string(),
    responseTime: z.string()
  }),
  seo: z.object({
    seoTitle: z.string().min(1).max(60),
    seoDesc: z.string().min(1).max(155),
    keywords: z.string().min(1)
  })
} satisfies Record<SectionId, z.ZodTypeAny>;

const systemPrompt = `You are a website content editor.
Return only valid JSON matching the requested shape.
Never include question labels, field keys, brackets, markdown, or code fences.
Use only facts supplied by the business owner. Do not invent prices, testimonials, credentials, guarantees, or contact details.`;

export async function regenerateSection(
  sectionId: SectionId,
  answers: string,
  siteData: SiteData
): Promise<AiResult<Record<string, unknown>>> {
  const groq = getGroqClient();
  if (!groq) {
    return {
      success: true,
      data: buildSectionFallback(sectionId, answers, siteData),
      source: "fallback",
      errors: ["GROQ_API_KEY is not configured; fallback section update was used."]
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
          { role: "system", content: systemPrompt },
          { role: "user", content: buildSectionPrompt(sectionId, answers, siteData) }
        ]
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const patch = sectionPatchSchemas[sectionId].parse(parseJsonObject(raw)) as Record<string, unknown>;

      return {
        success: true,
        data: { ...patch, _updated: Date.now() },
        source: "groq"
      };
    } catch (error) {
      errors.push(`Attempt ${attempt}: ${String(error)}`);
    }
  }

  return {
    success: true,
    data: buildSectionFallback(sectionId, answers, siteData),
    source: "fallback",
    errors
  };
}

export function buildSectionFallback(
  sectionId: SectionId,
  answers: string,
  siteData: SiteData
): Record<string, unknown> {
  const base = { _updated: Date.now() };

  if (sectionId === "hero") {
    const answer = findAnswer(answers, ["tagline", "diff"]);
    return {
      ...base,
      tagline: answer || textValue(siteData.tagline),
      desc: textValue(siteData.desc)
    };
  }

  if (sectionId === "about") {
    return {
      ...base,
      about: stripAnswerLabels(answers) || textValue(siteData.about)
    };
  }

  if (sectionId === "contact") {
    return {
      ...base,
      location: textValue(siteData.location)
    };
  }

  return base;
}

function buildSectionPrompt(sectionId: SectionId, answers: string, siteData: SiteData): string {
  const context = `Business: ${textValue(siteData.name)}
Type: ${textValue(siteData.tag)}
Location: ${textValue(siteData.location)}
Owner answers:
${answers}`;

  const requestedShapes: Record<SectionId, string> = {
    hero: '{"tagline":"headline under 10 words","desc":"two-sentence description"}',
    features: '{"features":[{"icon":"emoji","title":"title","body":"description"}]}',
    testimonials: '{"testimonials":[{"name":"provided customer name","location":"provided location","text":"provided feedback","rating":5}]}',
    products: '{"products":[{"name":"name","price":"provided price or empty string","emoji":"emoji","bg":"#RRGGBB"}]}',
    about: '{"about":"two or three sentence about section","volume":"provided number or neutral value","unit":"provided unit or neutral value"}',
    values: '{"values":[{"icon":"emoji","title":"value","body":"description"}]}',
    faq: '{"faq":[{"q":"question","a":"answer"}]}',
    contact: '{"location":"location","contactEmail":"email or empty string","contactPhone":"phone or empty string","openHours":"hours or empty string","responseTime":"response time or empty string"}',
    seo: '{"seoTitle":"under 60 characters","seoDesc":"under 155 characters","keywords":"comma-separated keywords"}'
  };

  return `${context}

Update the ${sectionId} section using only the owner answers and existing business context.
Return JSON in this shape:
${requestedShapes[sectionId]}`;
}

function findAnswer(answers: string, keys: string[]): string {
  const line = answers
    .split("\n")
    .find((value) => keys.some((key) => value.includes(`[${key}]`)));
  return line ? line.replace(/\[\w+\]\s*/, "").trim() : "";
}

function stripAnswerLabels(answers: string): string {
  return answers.replace(/\[\w+\]\s*/g, "").trim();
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}
