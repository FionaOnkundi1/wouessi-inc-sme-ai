import { Router } from "express";
import { aiRouter } from "./ai.js";
import { sessionsRouter } from "./sessions.js";
import { sitesRouter } from "./sites.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/", aiRouter);
apiRouter.use("/sites", sitesRouter);
