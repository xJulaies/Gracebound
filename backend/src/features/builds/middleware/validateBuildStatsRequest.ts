import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { calculateBuildStatsSchema } from "../schemas/buildStats.schema";

export const validateBuildStatsRequest: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = calculateBuildStatsSchema.safeParse(request.body);
  if (!result.success) {
    next(createError(400, "Invalid build stats data"));
    return;
  }
  response.locals.validatedBuildStats = result.data;
  next();
};
