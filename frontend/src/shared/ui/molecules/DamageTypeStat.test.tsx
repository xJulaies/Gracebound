import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { isDamageType } from "../../domain/damageTypes";
import { DamageTypeStat } from "./DamageTypeStat";

describe("DamageTypeStat", () => {
  it("keeps the damage type readable without relying on color", () => {
    render(<dl><DamageTypeStat label="Magic" type="magic" value="40%" /></dl>);

    expect(screen.getByText("Magic")).toBeVisible();
    expect(screen.getByText("40%")).toBeVisible();
    expect(isDamageType("magic")).toBe(true);
    expect(isDamageType("bleed")).toBe(false);
  });
});
