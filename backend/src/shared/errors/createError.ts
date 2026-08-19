import type { TCreateError, TStatusCode } from "./error.types";

export function createError(status: TStatusCode, message: string): TCreateError {
  const error = new Error(message) as TCreateError;
  error.status = status;
  error.isOperational = true;

  return error;
}

export function isCreateError(error: unknown): error is TCreateError {
  return (
    error instanceof Error &&
    "isOperational" in error &&
    error.isOperational === true &&
    "status" in error &&
    typeof error.status === "number"
  );
}
