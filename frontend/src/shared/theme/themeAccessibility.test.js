import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const themeCss = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
const TEXT_TOKENS = [
  "foreground",
  "foreground-muted",
  "accent",
  "danger",
  "success",
  "moon",
];

describe.each(["grace", "night"])("%s theme contrast", (theme) => {
  it("keeps semantic text readable on the darkest supported surface", () => {
    const surface = getThemeToken(theme, "surface-elevated");

    for (const token of TEXT_TOKENS) {
      const foreground = getThemeToken(theme, token);
      expect(contrastRatio(foreground, surface), token).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps component boundaries distinguishable from elevated surfaces", () => {
    expect(contrastRatio(
      getThemeToken(theme, "border"),
      getThemeToken(theme, "surface-elevated"),
    )).toBeGreaterThanOrEqual(3);
  });
});

function getThemeToken(theme, token) {
  const selector = `[data-theme="${theme}"]`;
  const selectorStart = themeCss.indexOf(selector);
  const blockStart = themeCss.indexOf("{", selectorStart);
  const blockEnd = themeCss.indexOf("}", blockStart);
  const block = selectorStart >= 0 && blockStart >= 0 && blockEnd >= 0
    ? themeCss.slice(blockStart + 1, blockEnd)
    : undefined;
  const value = block?.match(
    new RegExp(`--theme-${token}:\\s*(#[a-f\\d]{6})`, "i"),
  )?.[1];
  if (!value) throw new Error(`Missing ${theme} theme token: ${token}`);
  return value;
}

function contrastRatio(firstColor, secondColor) {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color) {
  const channels = color.trim().match(/[a-f\d]{2}/gi);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hexadecimal color, received: ${color}`);
  }

  const [red, green, blue] = channels.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
