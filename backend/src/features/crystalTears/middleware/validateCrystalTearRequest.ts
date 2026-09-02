import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { crystalTearIdSchema } from "../schemas/crystalTear.schema";
export const validateCrystalTearId: RequestHandler = (request, response, next) => {
  const parsed = crystalTearIdSchema.safeParse(request.params);
  if (!parsed.success) return next(createError(400, "Invalid Crystal Tear ID"));
  response.locals.crystalTearId = parsed.data.crystalTearId;
  next();
};
