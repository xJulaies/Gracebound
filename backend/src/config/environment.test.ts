import { describe, expect, it } from "vitest";
import { parseEnvironment } from "./environment";

describe("parseEnvironment", () => {
  it("parses a valid environment", () => {
    const result = parseEnvironment({
      NODE_ENV: "production",
      PORT: "4000",
      CORS_ORIGIN: "https://gracebound.example",
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
    });

    expect(result).toEqual({
      NODE_ENV: "production",
      PORT: 4000,
      CORS_ORIGIN: "https://gracebound.example",
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
    });
  });

  it("uses development defaults", () => {
    const result = parseEnvironment({
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
    });

    expect(result.NODE_ENV).toBe("development");
    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGIN).toBe("http://localhost:5173");
  });

  it.each(["not-a-number", "0", "65536"])(
    "rejects invalid port %s",
    (port) => {
      expect(() =>
        parseEnvironment({
          PORT: port,
          MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
        }),
      ).toThrow("Invalid environment configuration: PORT");
    },
  );

  it("rejects an invalid MongoDB URL without exposing its value", () => {
    const invalidUrl = "invalid-uri-with-secret-value";

    expect(() => parseEnvironment({ MONGODB_URL: invalidUrl })).toThrow(
      "Invalid environment configuration: MONGODB_URL",
    );

    try {
      parseEnvironment({ MONGODB_URL: invalidUrl });
    } catch (error) {
      expect((error as Error).message).not.toContain(invalidUrl);
    }
  });

  it("rejects an invalid CORS origin", () => {
    expect(() =>
      parseEnvironment({
        CORS_ORIGIN: "not-a-url",
        MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
      }),
    ).toThrow("Invalid environment configuration: CORS_ORIGIN");
  });
});
