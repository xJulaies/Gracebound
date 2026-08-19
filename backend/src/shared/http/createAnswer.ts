import type { TStatusCode } from "../errors/error.types";

export function createAnswer(
  status: TStatusCode,
  message: string,
  data: unknown[],
) {
  return { status, message, data };
}
