import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";

const spellIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const spellQuerySchema = z.strictObject({ type: z.enum(["sorcery", "incantation"]).optional() });

export const validateSpellId: RequestHandler = (request, response, next) => {
  const result = spellIdSchema.safeParse(request.params.spellId);
  if (!result.success) throw createError(400, "Invalid spell ID");
  response.locals.spellId = result.data;
  next();
};

export const validateSpellQuery: RequestHandler = (request, response, next) => {
  const result = spellQuerySchema.safeParse(request.query);
  if (!result.success) throw createError(400, "Invalid spell query");
  response.locals.spellQuery = result.data;
  next();
};
