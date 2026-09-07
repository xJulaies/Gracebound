import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EffectActivationControl } from "./EffectActivationControl";

describe("EffectActivationControl", () => {
  it("exposes its simulation state and toggles accessibly", async () => {
    const onChange = vi.fn();
    render(<EffectActivationControl active={false} label="Great Rune" onChange={onChange} />);

    const button = screen.getByRole("button", { name: "Activate Great Rune" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
