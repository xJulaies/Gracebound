import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EquipmentCatalogCard } from "./EquipmentCatalogCard";

describe("EquipmentCatalogCard", () => {
  it("shows the complete catalog summary for an item", () => {
    render(<EquipmentCatalogCard onOpen={vi.fn()} item={{
      category: "talismans",
      description: "A talisman depicting a claw and an assassin.",
      iconUrl: "/claw.webp",
      id: "claw-talisman",
      metadata: ["Build calculation supported"],
      name: "Claw Talisman",
      summary: "Enhances jump attacks.",
      source: {
        id: "claw-talisman",
        name: "Claw Talisman",
        summary: "Enhances jump attacks.",
        description: "A talisman depicting a claw and an assassin.",
        iconId: 1,
        iconUrl: "/claw.webp",
        weight: 0.7,
        calculationStatus: "supported",
        effects: {},
        gameVersion: "1.17.0",
      },
      weight: 0.7,
    }} />);

    expect(screen.getByRole("heading", { name: "Claw Talisman" })).toBeInTheDocument();
    expect(screen.getByText("Enhances jump attacks.")).toBeInTheDocument();
    expect(screen.getByText("A talisman depicting a claw and an assassin.")).toBeInTheDocument();
    expect(screen.getByText("Build calculation supported · Weight 0.7")).toBeInTheDocument();
  });
});
