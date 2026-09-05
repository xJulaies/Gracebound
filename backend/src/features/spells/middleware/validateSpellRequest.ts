import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";
import { SPELL_SCHOOLS } from "../domain/spell.types";

const spellIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const spellQuerySchema = z.strictObject({
  type: z.enum(["sorcery", "incantation"]).optional(),
  school: z.enum(SPELL_SCHOOLS).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

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
