import type { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { createAnswer } from "../http/createAnswer";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

export function createApiRateLimiter(options = {
  limit: 1_000,
  windowMs: FIFTEEN_MINUTES_MS,
}) {
  return createRequestRateLimiter(options, "API request limit exceeded");
}

export function createCalculationRateLimiter(options = {
  limit: 120,
  windowMs: ONE_MINUTE_MS,
}) {
  return createRequestRateLimiter(options, "Calculation request limit exceeded");
}

export function createBuildListRateLimiter(options = {
  limit: 300,
  windowMs: ONE_MINUTE_MS,
}) {
  return createRequestRateLimiter(options, "Build list request limit exceeded");
}

export function createBuildMutationRateLimiter(options = {
  limit: 120,
  windowMs: FIFTEEN_MINUTES_MS,
}) {
  return createRequestRateLimiter(
    options,
    "Build mutation request limit exceeded",
    (_request, response) => response.locals.authenticatedUserId as string,
  );
}

function createRequestRateLimiter(
  options: { limit: number; windowMs: number },
  message: string,
  keyGenerator?: (request: Request, response: Response) => string,
) {
  return rateLimit({
    ...options,
    legacyHeaders: false,
    standardHeaders: "draft-8",
    ...(keyGenerator && { keyGenerator }),
    handler: (_request, response) => {
      response.status(429).json(createAnswer(429, message, []));
    },
  });
}
