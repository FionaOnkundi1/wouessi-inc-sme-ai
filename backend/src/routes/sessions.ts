import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { submitAnswersSchema } from "../schemas/api.js";
import { answersToConversationText } from "../services/answers.js";

export const sessionsRouter = Router();

sessionsRouter.post("/", async (_req, res, next) => {
  try {
    const session = await prisma.session.create({
      data: { status: "created" }
    });

    res.status(201).json({ sessionId: session.id, status: session.status });
  } catch (error) {
    next(error);
  }
});

sessionsRouter.post("/:sessionId/answers", async (req, res, next) => {
  try {
    const body = submitAnswersSchema.parse(req.body);
    const conversationText = body.conversationText ?? answersToConversationText(body.answers ?? {});

    if (!conversationText.trim()) {
      throw new AppError(400, "At least one answer must contain text.");
    }

    const session = await prisma.session.update({
      where: { id: req.params.sessionId },
      data: {
        status: "answers_submitted",
        rawAnswers: body.answers ?? {},
        conversationText
      }
    });

    res.json({
      sessionId: session.id,
      status: session.status,
      conversationText: session.conversationText
    });
  } catch (error) {
    next(error);
  }
});
