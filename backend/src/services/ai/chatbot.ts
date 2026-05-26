import { env } from "../../config/env.js";
import { getGroqClient } from "./client.js";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function chatWithBusiness(
  message: string,
  businessData: Record<string, unknown>,
  history: ChatMessage[] = []
): Promise<string> {
  const groq = getGroqClient();

  // Build a readable business summary for the system prompt
  const businessSummary = [
    `Business name: ${businessData.businessName ?? "Unknown"}`,
    `Business type: ${businessData.businessType ?? "Unknown"}`,
    `Products or services: ${businessData.productsOrServices ?? "Unknown"}`,
    `Location: ${businessData.location ?? "Unknown"}`,
    `Target customers: ${businessData.targetCustomers ?? "Unknown"}`,
    `Unique selling point: ${businessData.uniqueSellingPoint ?? "Unknown"}`,
    `Tagline: ${businessData.tagline ?? ""}`,
    `Short description: ${businessData.shortDescription ?? ""}`,
    `Contact hint: ${businessData.contactHint ?? ""}`,
  ]
    .filter((line) => !line.endsWith("Unknown") && !line.endsWith(""))
    .join("\n");

  const systemPrompt = `You are a helpful assistant embedded on a small business website.
You only answer questions about this specific business. Do not answer unrelated questions.
Be friendly, concise, and helpful. If you don't know the answer based on the business information provided, say so politely.

Here is the business information:
${businessSummary}`;

  // Fallback if no API key
  if (!groq) {
    return buildFallbackReply(message, businessData);
  }

  try {
    const completion = await groq.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message }
      ]
    });

    return completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";
  } catch {
    return buildFallbackReply(message, businessData);
  }
}

function buildFallbackReply(
  message: string,
  businessData: Record<string, unknown>
): string {
  const lower = message.toLowerCase();
  const name = String(businessData.businessName ?? "this business");
  const location = String(businessData.location ?? "our area");
  const products = String(businessData.productsOrServices ?? "our products and services");
  const contact = String(businessData.contactHint ?? "");

  if (lower.includes("where") || lower.includes("location")) {
    return `We are based in ${location}. Feel free to get in touch for more details!`;
  }
  if (lower.includes("what") && (lower.includes("sell") || lower.includes("offer") || lower.includes("do"))) {
    return `${name} offers ${products}. We'd love to help you find exactly what you need!`;
  }
  if (lower.includes("contact") || lower.includes("email") || lower.includes("phone")) {
    return contact
      ? `You can reach us at: ${contact}`
      : `Please use the contact form on this page and we'll get back to you as soon as possible!`;
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
    return `Pricing varies depending on your needs. Please get in touch and we'll be happy to provide a quote!`;
  }
  return `Thanks for your question! ${name} is here to help. Please use the contact form and we'll get back to you shortly.`;
}
