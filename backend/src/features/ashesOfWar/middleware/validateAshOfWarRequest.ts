import type { RequestHandler } from "express";
import { z } from "zod";
import { createAnswer } from "../../../shared/http/createAnswer";
import { WEAPON_AFFINITIES } from "../../weapons/domain/weaponCatalog.types";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const querySchema = z.strictObject({
  weaponType: slug.optional(),
  affinity: z.enum(WEAPON_AFFINITIES).optional(),
  calculationStatus: z.enum(["supported", "catalog-only"]).optional(),
});

export const validateAshOfWarQuery: RequestHandler = (request, response, next) => {
  const result = querySchema.safeParse(request.query);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid Ash of War query", []));
    return;
  }
  response.locals.ashOfWarFilters = result.data;
  next();
};

export const validateAshOfWarId: RequestHandler = (request, response, next) => {
  const result = slug.safeParse(request.params.ashOfWarId);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid Ash of War ID", []));
    return;
  }
  response.locals.ashOfWarId = result.data;
  next();
};
