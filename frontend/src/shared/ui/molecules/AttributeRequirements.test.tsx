import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttributeRequirements } from "./AttributeRequirements";

describe("AttributeRequirements", () => {
  it("compares reusable requirements with the effective character stats", () => {
    render(
      <AttributeRequirements
        currentStats={{ vigor: 10, mind: 10, endurance: 10, strength: 12, dexterity: 10, intelligence: 20, faith: 8, arcane: 8 }}
        requirements={{ strength: 10, intelligence: 24, faith: 0 }}
      />,
    );

    expect(screen.getByText(/12 \/ 10/)).toHaveTextContent("requirement met");
    expect(screen.getByText(/20 \/ 24/)).toHaveTextContent("requirement not met");
    expect(screen.queryByText("Faith")).not.toBeInTheDocument();
  });
});
