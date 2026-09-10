import { describe, expect, it } from "vitest";
import type { BossData } from "../../../features/bosses/domain/boss.types";
import { unclassifiedBossMetadata } from "../../../features/bosses/domain/boss.types";
import { applyBossPhaseProfile, applyLinkedBossPhaseProfiles } from "./bossPhaseProfiles";

describe("applyBossPhaseProfile", () => {
  it("uses Godfrey's phase-one negation and changes to Hoarah Loux at half health", () => {
    const boss = applyBossPhaseProfile(createBoss("godfrey-first-elden-lord-47210070"));

    expect(boss.absorption).toEqual({
      physical: { standard: 10, slash: 10, strike: 10, pierce: 0 },
      magic: 20, fire: 20, lightning: 0, holy: 40,
    });
    expect(boss.phases).toMatchObject([
      { id: "godfrey", phaseNumber: 1, trigger: null },
      { id: "hoarah-loux", phaseNumber: 2, trigger: { type: "health-percentage", threshold: 50 } },
    ]);
    expect(boss.phases?.[1]?.absorption.magic).toBe(0);
  });

  it("uses a separate 80-percent health bar for Malenia's second phase", () => {
    const boss = applyBossPhaseProfile({ ...createBoss("malenia-blade-of-miquella"), health: 18_473 });
    expect(boss.phases?.[1]).toMatchObject({
      id: "goddess-of-rot",
      trigger: { type: "health-depleted" },
      health: 14_778,
    });
  });

  it("does not invent phases for ordinary encounters", () => {
    expect(applyBossPhaseProfile(createBoss("margit-the-fell-omen")).phases).toEqual([]);
  });

  it("links encounters whose second phase uses another NPC profile", () => {
    const first = { ...createBoss("radagon-of-the-golden-order"), health: 13_339 };
    const second = { ...createBoss("elden-beast"), health: 22_127 };
    second.absorption.magic = 40;

    const linked = applyLinkedBossPhaseProfiles([first, second])[0];

    expect(linked?.phases?.[1]).toMatchObject({
      id: "elden-beast-phase-2",
      name: "elden-beast",
      health: 22_127,
      trigger: { type: "health-depleted" },
      absorption: { magic: 40 },
    });
  });
});

function createBoss(id: string): BossData {
  return {
    ...unclassifiedBossMetadata,
    id,
    name: id,
    health: 21_903,
    defense: { physical: 120, magic: 120, fire: 120, lightning: 120, holy: 120 },
    absorption: {
      physical: { standard: 0, slash: -10, strike: 0, pierce: 0 },
      magic: 0, fire: 0, lightning: 0, holy: 40,
    },
    sourceNpcId: 1,
    healthScalingEffectId: 1,
  };
}
