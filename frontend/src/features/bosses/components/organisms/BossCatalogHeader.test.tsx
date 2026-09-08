import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { BossCatalogHeader } from "./BossCatalogHeader";

describe("BossCatalogHeader", () => {
  it("provides an accessible search and filter group", async () => {
    const { container } = render(
      <BossCatalogHeader
        filters={{ search: "", region: "caelid", rewardsGreatRune: true }}
        onFilterChange={vi.fn()}
        onSearchChange={vi.fn()}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });
});
