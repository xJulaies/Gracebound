import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";

const armorIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const armorQuerySchema = z.strictObject({
  slot: z.enum(["head", "body", "arms", "legs"]).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const validateArmorQuery: RequestHandler = (request, response, next) => {
  const result = armorQuerySchema.safeParse(request.query);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid armor query", []));
    return;
  }
  response.locals.armorFilters = result.data;
  next();
};

export const validateArmorId: RequestHandler = (request, response, next) => {
  const result = armorIdSchema.safeParse(request.params.armorId);
  if (!result.success) throw createError(400, "Invalid armor ID");
  response.locals.armorId = result.data;
  next();
};
