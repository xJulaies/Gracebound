import { describe, expect, it } from "vitest";
import { parseFrontendEnvironment } from "./parseFrontendEnvironment";

describe("parseFrontendEnvironment", () => {
  it("keeps localhost defaults available outside production", () => {
    expect(parseFrontendEnvironment({}, "development")).toEqual({
      apiUrl: "http://localhost:3000/api",
      clerkPublishableKey: null,
    });
  });

  it("normalizes a configured API URL", () => {
    expect(parseFrontendEnvironment({
      VITE_API_URL: "http://localhost:3000/api/",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
    }, "development")).toEqual({
      apiUrl: "http://localhost:3000/api",
      clerkPublishableKey: "pk_test_publishable",
    });
  });

  it("requires an explicit HTTPS API URL in production", () => {
    expect(() => parseFrontendEnvironment({
      VITE_CLERK_PUBLISHABLE_KEY: "pk_live_publishable",
    }, "production")).toThrow(
      "Invalid frontend environment configuration: VITE_API_URL",
    );

    expect(() => parseFrontendEnvironment({
      VITE_API_URL: "http://api.gracebound.example/api",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_live_publishable",
    }, "production")).toThrow(
      "Invalid frontend environment configuration: VITE_API_URL",
    );
  });

  it("requires a live Clerk key in production", () => {
    expect(() => parseFrontendEnvironment({
      VITE_API_URL: "https://api.gracebound.example/api",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_test_publishable",
    }, "production")).toThrow(
      "Invalid frontend environment configuration: VITE_CLERK_PUBLISHABLE_KEY",
    );
  });

  it("accepts a complete production configuration", () => {
    expect(parseFrontendEnvironment({
      VITE_API_URL: "https://api.gracebound.example/api",
      VITE_CLERK_PUBLISHABLE_KEY: "pk_live_publishable",
    }, "production")).toEqual({
      apiUrl: "https://api.gracebound.example/api",
      clerkPublishableKey: "pk_live_publishable",
    });
  });
});
