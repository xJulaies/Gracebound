import type { RequestHandler } from "express";
import type { GetAuthenticatedUserId } from "../auth/authentication.types";
import { createError } from "../errors/createError";

export function requireAuthenticatedUser(
  getAuthenticatedUserId: GetAuthenticatedUserId,
): RequestHandler {
  return (request, response, next) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      next(createError(401, "Unauthorized"));
      return;
    }

    response.locals.authenticatedUserId = userId;
    next();
  };
}
