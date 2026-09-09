import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DamageTrialEffectToggle } from "./DamageTrialEffectToggle";

describe("DamageTrialEffectToggle", () => {
  it("exposes its pressed state and remains keyboard-operable", () => {
    const onToggle = vi.fn();
    render(
      <DamageTrialEffectToggle
        active
        description="Rune Arc effect"
        label="Godrick's Great Rune"
        onToggle={onToggle}
      />,
    );

    const toggle = screen.getByRole("button", { name: /Godrick's Great Rune/i });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(toggle, { key: "Enter" });
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
