import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusSectionTabs } from "./StatusSectionTabs";

describe("StatusSectionTabs", () => {
  it("changes sections by click and the complete tab keyboard pattern", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <StatusSectionTabs activeSection="offense" onChange={onChange} />,
    );

    const offense = screen.getByRole("tab", { name: "Offense" });
    const defense = screen.getByRole("tab", { name: "Defense" });
    expect(offense).toHaveAttribute("aria-selected", "true");

    await user.click(defense);
    expect(onChange).toHaveBeenLastCalledWith("defense");

    rerender(<StatusSectionTabs activeSection="defense" onChange={onChange} />);
    defense.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("resistances");
    expect(screen.getByRole("tab", { name: "Resistances" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("offense");
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("resistances");
  });
});
