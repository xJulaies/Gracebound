import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import {
  createBuildSchema,
  ownedBuildListQuerySchema,
  publicBuildListQuerySchema,
  savedBuildDamageSchema,
  updateBuildSchema,
} from "../schemas/build.schema";
import { buildIdSchema } from "../schemas/buildId.schema";

export const validateCreateBuild: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = createBuildSchema.safeParse(request.body);

  if (!result.success) {
    next(createError(400, "Invalid build data"));
    return;
  }

  response.locals.validatedBuild = result.data;
  next();
};

export const validateUpdateBuild: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = updateBuildSchema.safeParse(request.body);

  if (!result.success) {
    next(createError(400, "Invalid build data"));
    return;
  }

  response.locals.validatedBuildUpdate = result.data;
  next();
};

export const validateBuildId: RequestHandler = (request, response, next) => {
  const result = buildIdSchema.safeParse(request.params);

  if (!result.success) {
    next(createError(400, "Invalid build ID"));
    return;
  }

  response.locals.buildId = result.data.buildId;
  next();
};

export const validateSavedBuildDamage: RequestHandler = (request, response, next) => {
  const result = savedBuildDamageSchema.safeParse(request.body);
  if (!result.success) {
    next(createError(400, "Invalid build damage selection"));
    return;
  }
  response.locals.validatedSavedBuildDamage = result.data;
  next();
};

export const validatePublicBuildListQuery: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = publicBuildListQuerySchema.safeParse(request.query);
  if (!result.success) {
    next(createError(400, "Invalid build query"));
    return;
  }
  response.locals.buildListQuery = result.data;
  next();
};

export const validateOwnedBuildListQuery: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = ownedBuildListQuerySchema.safeParse(request.query);
  if (!result.success) {
    next(createError(400, "Invalid build query"));
    return;
  }
  response.locals.buildListQuery = result.data;
  next();
};
