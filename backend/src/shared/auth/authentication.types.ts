import type { Request, RequestHandler } from "express";

export type GetAuthenticatedUserId = (request: Request) => string | null;

export interface Authentication {
  authenticationMiddleware: RequestHandler;
  getAuthenticatedUserId: GetAuthenticatedUserId;
}
