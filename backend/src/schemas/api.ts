import { z } from "zod";
import { businessDataSchema, checklistAnswersSchema } from "./business.js";

export const submitAnswersSchema = z
  .object({
    answers: checklistAnswersSchema.optional(),
    conversationText: z.string().trim().min(1).optional()
  })
  .refine((value) => value.answers || value.conversationText, {
    message: "Provide either answers or conversationText"
  });

export const extractBusinessDataRequestSchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    answers: checklistAnswersSchema.optional(),
    conversationText: z.string().trim().min(1).optional()
  })
  .refine((value) => value.sessionId || value.answers || value.conversationText, {
    message: "Provide sessionId, answers, or conversationText"
  });

export const generateSiteRequestSchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    businessData: businessDataSchema.optional()
  })
  .refine((value) => value.sessionId || value.businessData, {
    message: "Provide either sessionId or businessData"
  });

export const generateSeoRequestSchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    websiteId: z.string().uuid().optional(),
    businessData: businessDataSchema.optional()
  })
  .refine((value) => value.sessionId || value.websiteId || value.businessData, {
    message: "Provide sessionId, websiteId, or businessData"
  });

export const publishSiteRequestSchema = z.object({
  siteId: z.string().min(1)
});

export const regenerateSectionRequestSchema = z.object({
  sectionId: z.enum([
    "hero",
    "features",
    "testimonials",
    "products",
    "about",
    "values",
    "faq",
    "contact",
    "seo"
  ]),
  answers: z.string().trim().min(1).max(10_000),
  siteData: z.record(z.unknown())
});
