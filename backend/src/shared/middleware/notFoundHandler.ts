import type { RequestHandler } from "express";
import { createError } from "../errors/createError";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(createError(404, "Route not found"));
};
