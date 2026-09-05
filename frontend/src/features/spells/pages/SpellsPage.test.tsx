import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpellsPage } from "./SpellsPage";

describe("SpellsPage", () => {
  it("provides the empty semantic page foundation", () => {
    render(<SpellsPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Spells" }))
      .toHaveClass("sr-only");
  });
});
