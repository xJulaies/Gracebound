import { describe, expect, it } from "vitest";
import { createIconUrl } from "./createIconUrl";

describe("createIconUrl", () => {
  it("creates the stable relative asset route", () => {
    expect(createIconUrl(6000)).toBe("/api/assets/icons/6000");
  });
});
