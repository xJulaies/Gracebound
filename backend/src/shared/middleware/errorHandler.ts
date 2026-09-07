import type { ErrorRequestHandler } from "express";
import { settings } from "../../config/settings";
import { isCreateError } from "../errors/createError";
import { createAnswer } from "../http/createAnswer";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isCreateError(err)) {
    res.status(err.status).json(createAnswer(err.status, err.message, []));
    return;
  }

  if (isPayloadTooLargeError(err)) {
    res.status(413).json(createAnswer(413, "Request body is too large", []));
    return;
  }

  const loggedError = settings.NODE_ENV === "production"
    ? { name: err instanceof Error ? err.name : "UnknownError" }
    : err;

  console.error("Unexpected application error", loggedError);
  res.status(500).json(createAnswer(500, "Internal server error", []));
};

function isPayloadTooLargeError(error: unknown): error is { status: 413 } {
  return typeof error === "object"
    && error !== null
    && "status" in error
    && error.status === 413;
}
