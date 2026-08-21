import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { calculateDamageSchema } from "../schemas/damage.schema";

export const validateDamageRequest: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = calculateDamageSchema.safeParse(request.body);

  if (!result.success) {
    next(createError(400, "Invalid damage calculation data"));
    return;
  }

  response.locals.validatedDamageCalculation = result.data;
  next();
};

