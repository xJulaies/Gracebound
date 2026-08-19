import { describe, expect, it } from "vitest";
import { parseEnvironment } from "./environment";

describe("parseEnvironment", () => {
  it("parses a valid environment", () => {
    const result = parseEnvironment({
      NODE_ENV: "production",
      PORT: "4000",
      CORS_ORIGIN: "https://gracebound.example",
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
      CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
      CLERK_SECRET_KEY: "sk_test_secret",
    });

    expect(result).toEqual({
      NODE_ENV: "production",
      PORT: 4000,
      CORS_ORIGIN: "https://gracebound.example",
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
      CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
      CLERK_SECRET_KEY: "sk_test_secret",
    });
  });

  it("uses development defaults", () => {
    const result = parseEnvironment({
      MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
      CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
      CLERK_SECRET_KEY: "sk_test_secret",
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
          CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
          CLERK_SECRET_KEY: "sk_test_secret",
        }),
      ).toThrow("Invalid environment configuration: PORT");
    },
  );

  it("rejects an invalid MongoDB URL without exposing its value", () => {
    const invalidUrl = "invalid-uri-with-secret-value";

    const environment = {
      MONGODB_URL: invalidUrl,
      CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
      CLERK_SECRET_KEY: "sk_test_secret",
    };

    expect(() => parseEnvironment(environment)).toThrow(
      "Invalid environment configuration: MONGODB_URL",
    );

    try {
      parseEnvironment(environment);
    } catch (error) {
      expect((error as Error).message).not.toContain(invalidUrl);
    }
  });

  it("rejects an invalid CORS origin", () => {
    expect(() =>
      parseEnvironment({
        CORS_ORIGIN: "not-a-url",
        MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
        CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
        CLERK_SECRET_KEY: "sk_test_secret",
      }),
    ).toThrow("Invalid environment configuration: CORS_ORIGIN");
  });

  it("requires both Clerk keys", () => {
    expect(() =>
      parseEnvironment({
        MONGODB_URL: "mongodb://127.0.0.1:27017/gracebound",
      }),
    ).toThrow(
      "Invalid environment configuration: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY",
    );
  });
});
