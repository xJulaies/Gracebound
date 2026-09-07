import { describe, expect, it } from "vitest";
import { calculateFloatingPreviewPosition } from "./calculateFloatingPreviewPosition";

describe("calculateFloatingPreviewPosition", () => {
  it("keeps a 1.5rem inset from every container edge", () => {
    const container = rect(42, 20, 500, 700);
    const preview = rect(0, 0, 256, 160);

    expect(calculateFloatingPreviewPosition({
      anchor: rect(42, 80, 100, 100),
      container,
      preview,
      rootFontSize: 16,
      viewportHeight: 800,
      viewportWidth: 900,
    })).toEqual({ left: 66, top: 188 });

    expect(calculateFloatingPreviewPosition({
      anchor: rect(442, 650, 100, 50),
      container,
      preview,
      rootFontSize: 16,
      viewportHeight: 800,
      viewportWidth: 900,
    })).toEqual({ left: 262, top: 482 });
  });
});

function rect(left: number, top: number, width: number, height: number) {
  return { left, top, width, height, right: left + width, bottom: top + height };
}
