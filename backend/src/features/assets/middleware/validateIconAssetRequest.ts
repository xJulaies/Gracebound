import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { iconIdParamSchema } from "../schemas/iconAsset.schema";

export const validateIconId: RequestHandler = (request, response, next) => {
  const parsed = iconIdParamSchema.safeParse(request.params);
  if (!parsed.success) return next(createError(400, "Invalid icon ID"));
  response.locals.iconId = parsed.data.iconId;
  next();
};
