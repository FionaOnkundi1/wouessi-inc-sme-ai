import { z } from "zod";

export const allowedWebsiteVibes = [
  "modern",
  "warm",
  "bold",
  "minimal",
  "professional",
  "playful"
] as const;

export const confidenceLevels = ["high", "medium", "low"] as const;

export const businessDataSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  productsOrServices: z.string().min(1),
  location: z.string().min(1),
  targetCustomers: z.string().min(1),
  uniqueSellingPoint: z.string().min(1),
  websiteVibe: z.enum(allowedWebsiteVibes),
  extraFeatures: z.string().default(""),
  tagline: z.string().min(1),
  shortDescription: z.string().min(1),
  contactHint: z.string().default(""),
  competitorReference: z.string().default(""),
  missingFields: z.array(z.string()).default([]),
  confidence: z.enum(confidenceLevels)
});

export type BusinessData = z.infer<typeof businessDataSchema>;

export const checklistAnswersSchema = z.object({
  businessName: z.string().optional(),
  description: z.string().optional(),
  customers: z.string().optional(),
  services: z.string().optional(),
  websiteGoal: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  stylePreference: z.string().optional(),
  competitorReference: z.string().optional()
});

export type ChecklistAnswers = z.infer<typeof checklistAnswersSchema>;
