import type { RequestHandler } from "express";
import { z } from "zod";
import { createAnswer } from "../../../shared/http/createAnswer";

const talismanIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const talismanQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(80).optional(),
  calculationStatus: z.enum(["catalog-only", "supported"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const validateTalismanQuery: RequestHandler = (request, response, next) => {
  const result = talismanQuerySchema.safeParse(request.query);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid talisman query", []));
    return;
  }
  response.locals.talismanFilters = result.data;
  next();
};

export const validateTalismanId: RequestHandler = (request, response, next) => {
  const result = talismanIdSchema.safeParse(request.params.talismanId);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid talisman ID", []));
    return;
  }
  response.locals.talismanId = result.data;
  next();
};
