import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";

const bossImageIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const validateBossImageId: RequestHandler = (request, response, next) => {
  const parsed = bossImageIdSchema.safeParse(request.params.bossId);
  if (!parsed.success) return next(createError(400, "Invalid boss image ID"));
  response.locals.bossImageId = parsed.data;
  return next();
};
