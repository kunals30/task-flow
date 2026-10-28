import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../errors.js";

export const notFound: RequestHandler = (_req, _res, next) => next(new HttpError(404, "Route not found"));

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
    return;
  }
  // Malformed JSON body from express.json()
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Malformed JSON body" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
