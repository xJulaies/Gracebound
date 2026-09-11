import { API_URL } from "../config/environment";
import { z } from "zod";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T[];
  totalCount?: number;
}

type GetToken = () => Promise<string | null>;

interface ApiRequestOptions<T> extends Omit<RequestInit, "headers"> {
  getToken?: GetToken;
  headers?: Record<string, string>;
  responseSchema?: z.ZodType<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiResponseValidationError extends Error {
  constructor(public readonly issues: z.ZodError["issues"]) {
    const firstIssue = issues[0];
    const detail = firstIssue
      ? ` ${firstIssue.path.join(".") || "response"}: ${firstIssue.message}`
      : "";
    super(`The server returned an invalid response.${detail}`);
    this.name = "ApiResponseValidationError";
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions<T> = {},
): Promise<ApiResponse<T>> {
  const {
    getToken,
    headers: additionalHeaders,
    responseSchema,
    ...requestOptions
  } = options;
  const token = await getToken?.();
  const headers = new Headers(additionalHeaders);

  headers.set("Accept", "application/json");
  if (requestOptions.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });
  const rawBody: unknown = await response.json();
  const itemSchema: z.ZodType<T> = responseSchema ?? z.custom<T>();
  const envelopeSchema = z.strictObject({
    status: z.number().int(),
    message: z.string(),
    data: z.array(itemSchema),
  });
  const parsedBody = envelopeSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    throw new ApiResponseValidationError(parsedBody.error.issues);
  }

  const body = parsedBody.data;

  if (!response.ok) {
    throw new ApiError(response.status, body.message || "Request failed");
  }

  const totalCountHeader = response.headers.get("X-Total-Count");

  return {
    ...body,
    ...(totalCountHeader !== null && {
      totalCount: Number(totalCountHeader),
    }),
  };
}
