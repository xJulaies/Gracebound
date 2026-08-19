import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Authentication } from "../../shared/auth/authentication.types";

export function createClerkAuthentication(): Authentication {
  return {
    authenticationMiddleware: clerkMiddleware(),
    getAuthenticatedUserId(request) {
      const { isAuthenticated, userId } = getAuth(request);
      return isAuthenticated ? userId : null;
    },
  };
}
