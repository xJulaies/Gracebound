import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpellMemorySlot } from "./SpellMemorySlot";

describe("SpellMemorySlot", () => {
  it("exposes an empty memory slot as a named control", () => {
    render(<SpellMemorySlot index={4} />);

    expect(screen.getByRole("button", {
      name: "Spell slot 4: Empty. Select spell",
    })).toBeInTheDocument();
  });
});
