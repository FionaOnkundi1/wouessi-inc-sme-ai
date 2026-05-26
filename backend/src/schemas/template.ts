import { z } from "zod";

export const templateSelectionSchema = z.object({
  selectedTemplate: z.enum(["minimal-template", "warm-template", "bold-template"]),
  colorPalette: z.enum([
    "neutral",
    "warm-earth",
    "soft-pastel",
    "bold-contrast",
    "clean-blue",
    "elegant-dark"
  ]),
  fontPairing: z.enum([
    "modern-sans",
    "friendly-rounded",
    "elegant-serif",
    "bold-display"
  ]),
  sectionEmphasis: z.enum([
    "product-focused",
    "service-focused",
    "trust-focused",
    "contact-focused",
    "visual-focused"
  ]),
  reason: z.string().min(1)
});

export type TemplateSelection = z.infer<typeof templateSelectionSchema>;

export const defaultTemplateSelection: TemplateSelection = {
  selectedTemplate: "minimal-template",
  colorPalette: "neutral",
  fontPairing: "modern-sans",
  sectionEmphasis: "service-focused",
  reason: "Fallback selection used when AI template selection is unavailable."
};
