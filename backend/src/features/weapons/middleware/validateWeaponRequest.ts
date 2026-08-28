import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import {
  weaponIdSchema,
  weaponListQuerySchema,
} from "../schemas/weapon.schema";

export const validateWeaponId: RequestHandler = (request, response, next) => {
  const result = weaponIdSchema.safeParse(request.params);

  if (!result.success) {
    next(createError(400, "Invalid weapon ID"));
    return;
  }

  response.locals.weaponId = result.data.weaponId;
  next();
};

export const validateWeaponListQuery: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = weaponListQuerySchema.safeParse(request.query);

  if (!result.success) {
    next(createError(400, "Invalid weapon query"));
    return;
  }

  response.locals.weaponListQuery = result.data;
  next();
};
