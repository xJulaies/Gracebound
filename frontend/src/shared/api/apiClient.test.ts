import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  ApiError,
  ApiResponseValidationError,
  apiRequest,
} from "./apiClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("attaches a Clerk token to protected requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ status: 200, message: "Builds found", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/me/builds", {
      getToken: async () => "session-token",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("Authorization")).toBe(
      "Bearer session-token",
    );
  });

  it("throws a readable API error for failed requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ status: 401, message: "Unauthorized", data: [] }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(apiRequest("/me/builds")).rejects.toEqual(
      new ApiError(401, "Unauthorized"),
    );
  });

  it("validates response items with the supplied Zod schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ status: 200, message: "Found", data: [{ id: 42 }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(apiRequest("/items", {
      responseSchema: z.strictObject({ id: z.string() }),
    })).rejects.toBeInstanceOf(ApiResponseValidationError);
  });

  it("rejects malformed response envelopes even without an item schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ status: "200", data: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(apiRequest("/items")).rejects.toBeInstanceOf(ApiResponseValidationError);
  });
});
