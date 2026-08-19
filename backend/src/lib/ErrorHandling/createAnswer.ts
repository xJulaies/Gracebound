import { TStatusCode } from "../../types/error.types";

export const createAnswer = (
  status: TStatusCode,
  message: string,
  data: unknown[],
) => {
  return { status, message, data };
};
