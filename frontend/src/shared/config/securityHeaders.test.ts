import { describe, expect, it } from "vitest";
import { FRONTEND_SECURITY_HEADERS } from "./securityHeaders";

describe("FRONTEND_SECURITY_HEADERS", () => {
  it("protects the document without constraining Clerk or API origins prematurely", () => {
    expect(FRONTEND_SECURITY_HEADERS["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(FRONTEND_SECURITY_HEADERS["Content-Security-Policy"]).toContain(
      "object-src 'none'",
    );
    expect(FRONTEND_SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
    expect(FRONTEND_SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
  });
});
