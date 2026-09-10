import { describe, expect, it } from "vitest";
import type { Boss } from "../../../bosses/types/boss.types";
import { createActiveBossProfile } from "../../domain/createActiveBossProfile";

const defenses = { physical: 120, magic: 120, fire: 120, lightning: 120, holy: 120 };
const absorption = {
  physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
  magic: 20,
  fire: 20,
  lightning: 20,
  holy: 20,
};
const boss: Boss = {
  id: "godfrey-first-elden-lord",
  name: "Godfrey, First Elden Lord",
  imageUrl: "/api/assets/bosses/godfrey-first-elden-lord",
  encounters: [],
  rank: "major",
  progression: "required",
  rewardsGreatRune: false,
  rewardsRemembrance: true,
  health: 21_903,
  defense: defenses,
  absorption,
  gameVersion: "1.17.0",
};

describe("createActiveBossProfile", () => {
  it("uses the active phase portrait in the damage trial", () => {
    const activeBoss = createActiveBossProfile(
      boss,
      {
        id: "hoarah-loux",
        name: "Hoarah Loux, Warrior",
        imageUrl: "/api/assets/bosses/hoarah-loux",
        phaseNumber: 2,
        trigger: { type: "health-depleted" },
        health: 21_903,
        defense: defenses,
        absorption,
      },
      21_903,
    );

    expect(activeBoss.name).toBe("Hoarah Loux, Warrior");
    expect(activeBoss.imageUrl).toBe("/api/assets/bosses/hoarah-loux");
  });

  it("keeps the main portrait when a phase has no dedicated image", () => {
    const activeBoss = createActiveBossProfile(
      boss,
      {
        id: "opening-phase",
        name: boss.name,
        imageUrl: null,
        phaseNumber: 1,
        trigger: null,
        health: boss.health,
        defense: defenses,
        absorption,
      },
      boss.health,
    );

    expect(activeBoss.imageUrl).toBe(boss.imageUrl);
  });
});
