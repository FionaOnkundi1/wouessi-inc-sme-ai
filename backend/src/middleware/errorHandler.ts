import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { isAppError } from "../lib/errors.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      message: "Request validation failed",
      details: error.flatten()
    });
    return;
  }

  if (isAppError(error)) {
    res.status(error.statusCode).json({
      error: "AppError",
      message: error.message,
      details: error.details
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: "InternalServerError",
    message: env.NODE_ENV === "production" ? "Unexpected server error" : String(error)
  });
};
