import { describe, expect, it } from "vitest";
import { resolveApiAssetUrl } from "./resolveApiAssetUrl";

describe("resolveApiAssetUrl", () => {
  it("resolves a server-relative asset against the configured backend", () => {
    expect(
      resolveApiAssetUrl("/api/assets/character-classes/vagabond"),
    ).toBe("http://localhost:3000/api/assets/character-classes/vagabond");
  });

  it("rejects paths outside the public asset API", () => {
    expect(() => resolveApiAssetUrl("/api/character-classes")).toThrow(
      "Invalid API asset path",
    );
  });
});
