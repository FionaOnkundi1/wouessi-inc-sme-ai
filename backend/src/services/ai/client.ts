import OpenAI from "openai";
import { env } from "../../config/env.js";

export function getGroqClient(): OpenAI | null {
  if (!env.GROQ_API_KEY) return null;

  return new OpenAI({
    apiKey: env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
}
