import { groq } from "./client.js";

export const templateSelectionSystemPrompt = `
You are an AI template selection system for a small business website generator.

Your task is to select the best website template and style tokens based on structured business information.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.
Do not include extra text outside the JSON object.

Available templates:
- minimal-template
- warm-template
- bold-template

Template rules:
- minimal-template: best for elegant, simple, premium, professional, or clean businesses
- warm-template: best for handmade, food, wellness, beauty, family, friendly, or local businesses
- bold-template: best for creative, modern, fitness, events, youth-focused, or high-energy businesses

Allowed colorPalettes:
- neutral
- warm-earth
- soft-pastel
- bold-contrast
- clean-blue
- elegant-dark

Allowed fontPairings:
- modern-sans
- friendly-rounded
- elegant-serif
- bold-display

Allowed sectionEmphasis:
- product-focused
- service-focused
- trust-focused
- contact-focused
- visual-focused

Return JSON using this exact schema:

{
  "selectedTemplate": "",
  "colorPalette": "",
  "fontPairing": "",
  "sectionEmphasis": "",
  "reason": ""
}
`;

export async function selectTemplateAndStyle(businessData) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: templateSelectionSystemPrompt
        },
        {
          role: "user",
          content: `
Select the best template and style tokens for this business data:

${JSON.stringify(businessData, null, 2)}

Return ONLY valid JSON.
`
        }
      ]
    });

    const aiText = completion.choices[0].message.content;
    console.log("=== RAW TEMPLATE SELECTION RESPONSE ===");
    console.log(aiText);

    return {
      success: true,
      data: JSON.parse(aiText)
    };
  } catch (error) {
    console.error("Template selection error:", error);

    return {
      success: false,
      errors: ["Failed to select template and style"]
    };
  }
}