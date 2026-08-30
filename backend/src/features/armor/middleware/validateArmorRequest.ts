import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";

const armorIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const validateArmorId: RequestHandler = (request, response, next) => {
  const result = armorIdSchema.safeParse(request.params.armorId);
  if (!result.success) throw createError(400, "Invalid armor ID");
  response.locals.armorId = result.data;
  next();
};
