import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { SpellCatalogHeader } from "./SpellCatalogHeader";

describe("SpellCatalogHeader", () => {
  it("shows only the schools for the selected spell type", async () => {
    const user = userEvent.setup();
    const onSchoolChange = vi.fn();
    const onTypeChange = vi.fn();
    const { container } = render(
      <SpellCatalogHeader
        filters={{ type: "sorcery", school: "gravity", search: "" }}
        onSchoolChange={onSchoolChange}
        onSearchChange={vi.fn()}
        onTypeChange={onTypeChange}
      />,
    );

    const school = screen.getByRole("button", { name: /^School:/ });
    await user.click(school);
    expect(screen.getByRole("button", { name: "Gravity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Frenzied Flame" }))
      .not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carian" }));
    await user.click(screen.getByRole("button", { name: "Incantations" }));

    expect(onSchoolChange).toHaveBeenCalledWith("carian");
    expect(onTypeChange).toHaveBeenCalledWith("incantation");
    await expectNoAccessibilityViolations(container);
  });
});
