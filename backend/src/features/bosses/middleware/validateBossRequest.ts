import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { bossIdSchema } from "../schemas/boss.schema";

export const validateBossId: RequestHandler = (request, response, next) => {
  const result = bossIdSchema.safeParse(request.params);

  if (!result.success) {
    next(createError(400, "Invalid boss ID"));
    return;
  }

  response.locals.bossId = result.data.bossId;
  next();
};
