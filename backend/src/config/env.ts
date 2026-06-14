import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:4000"),
  PUBLIC_SITE_BASE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional()
});

export const env = envSchema.parse(process.env);

export const clerkConfigured = Boolean(env.CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
