import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { greatRuneIdSchema } from "../schemas/greatRune.schema";

export const validateGreatRuneId: RequestHandler = (request, response, next) => {
  const parsed = greatRuneIdSchema.safeParse(request.params);
  if (!parsed.success) return next(createError(400, "Invalid Great Rune ID"));
  response.locals.greatRuneId = parsed.data.greatRuneId;
  next();
};
