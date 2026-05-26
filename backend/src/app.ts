import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 60,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Multer for audio file uploads (transcription route)
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  app.use("/api/transcribe", upload.single("audio"));

  app.get("/", (_req, res) => {
    res.json({
      name: "Wouessi Backend API",
      status: "running",
      health: "/api/health",
      frontend: env.FRONTEND_ORIGIN,
      endpoints: [
        "POST /api/sessions",
        "POST /api/sessions/:sessionId/answers",
        "POST /api/extract-business-data",
        "POST /api/generate-site",
        "POST /api/generate-seo",
        "POST /api/publish-site",
        "GET /api/sites/:siteId",
        "POST /api/transcribe",
        "POST /api/chat"
      ]
    });
  });

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
