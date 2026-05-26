import { Router } from "express";
import { z } from "zod";
import { chatWithBusiness } from "../services/ai/chatbot.js";

export const chatRouter = Router();

const chatRequestSchema = z.object({
  message: z.string().min(1),
  businessData: z.record(z.unknown()),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).default([])
});

chatRouter.post("/chat", async (req, res, next) => {
  try {
    const body = chatRequestSchema.parse(req.body);
    const reply = await chatWithBusiness(body.message, body.businessData, body.history);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
});
