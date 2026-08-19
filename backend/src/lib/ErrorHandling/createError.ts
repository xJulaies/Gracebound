import type { TStatusCode } from "../../types/error.types";

export type TCreateError = Error & { status: TStatusCode };

export const createError = (status: TStatusCode, message: string) => {
  const error = new Error(message) as TCreateError;
  error.status = status;

  return error;
};
