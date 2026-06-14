import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { submitAnswersSchema } from "../schemas/api.js";
import { answersToConversationText } from "../services/answers.js";
import {
  assertResourceAccess,
  createOwnership,
  getRequestPrincipal
} from "../middleware/auth.js";

export const sessionsRouter = Router();

sessionsRouter.post("/", async (req, res, next) => {
  try {
    const ownership = createOwnership(getRequestPrincipal(req));
    const session = await prisma.session.create({
      data: {
        status: "created",
        ownerId: ownership.ownerId,
        claimTokenHash: ownership.claimTokenHash,
        claimTokenExpiresAt: ownership.claimTokenExpiresAt
      }
    });

    res.status(201).json({
      sessionId: session.id,
      status: session.status,
      claimToken: ownership.claimToken
    });
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

    const existingSession = await prisma.session.findUnique({
      where: { id: req.params.sessionId }
    });
    if (!existingSession) {
      throw new AppError(404, "Draft was not found.");
    }
    assertResourceAccess(existingSession, getRequestPrincipal(req));

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
