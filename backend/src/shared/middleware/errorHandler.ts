import type { ErrorRequestHandler } from "express";
import { isCreateError } from "../errors/createError";
import { createAnswer } from "../http/createAnswer";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isCreateError(err)) {
    res.status(err.status).json(createAnswer(err.status, err.message, []));
    return;
  }

  console.error("Unexpected application error", err);
  res.status(500).json(createAnswer(500, "Internal server error", []));
};
