import { describe, expect, it } from "vitest";
import { createBossCatalogSourceHash } from "./createBossCatalogSourceHash";

describe("createBossCatalogSourceHash", () => {
  it("creates a deterministic fingerprint from Regulation and curated boss data", () => {
    const regulationHash = "a".repeat(64);

    const first = createBossCatalogSourceHash(regulationHash);
    const second = createBossCatalogSourceHash(regulationHash.toUpperCase());

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(second);
    expect(first).not.toBe(regulationHash);
  });

  it("changes when the Regulation source changes", () => {
    expect(createBossCatalogSourceHash("a".repeat(64))).not.toBe(
      createBossCatalogSourceHash("b".repeat(64)),
    );
  });

  it("rejects malformed Regulation source hashes", () => {
    expect(() => createBossCatalogSourceHash("invalid")).toThrow(
      "Regulation source hash must be a SHA-256 digest",
    );
  });
});
