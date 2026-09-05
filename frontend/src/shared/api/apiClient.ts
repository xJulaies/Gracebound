import { API_URL } from "../config/environment";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T[];
  totalCount?: number;
}

type GetToken = () => Promise<string | null>;

interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  getToken?: GetToken;
  headers?: Record<string, string>;
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

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { getToken, headers: additionalHeaders, ...requestOptions } = options;
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
  const body = (await response.json()) as ApiResponse<T>;

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
