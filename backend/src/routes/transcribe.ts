import { Router } from "express";
import { getGroqClient } from "../services/ai/client.js";
import { AppError } from "../lib/errors.js";
import { toFile } from "openai";

export const transcribeRouter = Router();

transcribeRouter.post("/transcribe", async (req, res, next) => {
  try {
    const groq = getGroqClient();

    if (!groq) {
      // Fallback: if no API key, return a demo transcript
      res.json({
        transcript: "I sell handmade candles in Melbourne, about 50 units per week.",
        source: "fallback",
        warning: "GROQ_API_KEY is not configured. Demo transcript returned."
      });
      return;
    }

    // Expect raw audio as Buffer from multipart/form-data
    const audioBuffer = (req as any).file?.buffer;
    const mimeType = (req as any).file?.mimetype ?? "audio/webm";

    if (!audioBuffer) {
      throw new AppError(400, "No audio file provided. Send audio as multipart/form-data with field name 'audio'.");
    }

    const audioFile = await toFile(audioBuffer, "recording.webm", { type: mimeType });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en"
    });

    res.json({
      transcript: transcription.text,
      source: "groq-whisper"
    });
  } catch (error) {
    next(error);
  }
});
