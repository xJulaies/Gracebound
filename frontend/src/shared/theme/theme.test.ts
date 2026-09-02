import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, resolveTheme, saveTheme } from "./theme";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("theme", () => {
  it("uses a stored Gracebound theme before the system preference", () => {
    expect(resolveTheme("grace", true)).toBe("grace");
    expect(resolveTheme("night", false)).toBe("night");
  });

  it("falls back to the matching system theme", () => {
    expect(resolveTheme(null, true)).toBe("night");
    expect(resolveTheme(null, false)).toBe("grace");
  });

  it("applies and persists an explicit selection", () => {
    applyTheme("night");
    expect(document.documentElement.dataset.theme).toBe("night");

    saveTheme("grace");
    expect(localStorage.getItem("gracebound-theme")).toBe("grace");
    expect(document.documentElement.dataset.theme).toBe("grace");
  });
});
