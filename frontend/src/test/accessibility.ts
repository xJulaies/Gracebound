import axe from "axe-core";
import { expect } from "vitest";

export async function expectNoAccessibilityViolations(
  container: HTMLElement,
): Promise<void> {
  const result = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      "link-in-text-block": { enabled: false },
    },
  });

  const violations = result.violations.map(({ help, id, nodes }) => ({
    help,
    id,
    targets: nodes.map((node) => node.target),
  }));

  expect(violations).toEqual([]);
}
