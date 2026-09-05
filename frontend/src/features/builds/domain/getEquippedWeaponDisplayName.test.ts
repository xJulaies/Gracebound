import { describe, expect, it } from "vitest";
import type { EquippedWeapon } from "../types/editor.types";
import { getEquippedWeaponDisplayName } from "./getEquippedWeaponDisplayName";

describe("getEquippedWeaponDisplayName", () => {
  it("combines the selected affinity, complete name, and upgrade level", () => {
    const selection = {
      weapon: {
        name: "Banished Knight's Greatsword",
        variants: [
          { id: "standard", affinity: "standard", maxUpgradeLevel: 25 },
          { id: "flame-art", affinity: "flame-art", maxUpgradeLevel: 25 },
        ],
      },
      variantId: "flame-art",
      upgradeLevel: 25,
    } as EquippedWeapon;

    expect(getEquippedWeaponDisplayName(selection)).toBe(
      "Flame Art Banished Knight's Greatsword +25",
    );
  });
});
