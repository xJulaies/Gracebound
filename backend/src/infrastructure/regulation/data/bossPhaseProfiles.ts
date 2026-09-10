import type { BossAbsorption, BossData, BossPhase } from "../../../features/bosses/domain/boss.types";

const GODFREY_PHASE_ONE_ABSORPTION: BossAbsorption = {
  physical: { standard: 10, slash: 10, strike: 10, pierce: 0 },
  magic: 20,
  fire: 20,
  lightning: 0,
  holy: 40,
};

/**
 * Encounter-level phase data that cannot be recovered from a single NpcParam row.
 * Regulation uses the same NPC row for these transformations; keeping the
 * exceptions here makes the provenance explicit and prevents UI-only fixes.
 */
export function applyBossPhaseProfile(boss: BossData): BossData {
  if (boss.id === "godfrey-first-elden-lord-47210070") {
    const phases: BossPhase[] = [
      createPhase(boss, "godfrey", "Godfrey, First Elden Lord", 1, null, {
        absorption: GODFREY_PHASE_ONE_ABSORPTION,
      }),
      createPhase(boss, "hoarah-loux", "Hoarah Loux, Warrior", 2, {
        type: "health-percentage",
        threshold: 50,
      }),
    ];

    return {
      ...boss,
      absorption: GODFREY_PHASE_ONE_ABSORPTION,
      phases,
    };
  }

  if (boss.id === "malenia-blade-of-miquella") {
    return {
      ...boss,
      phases: [
        createPhase(boss, "blade-of-miquella", "Malenia, Blade of Miquella", 1, null),
        createPhase(
          boss,
          "goddess-of-rot",
          "Malenia, Goddess of Rot",
          2,
          { type: "health-depleted" },
          { health: Math.floor(boss.health * 0.8) },
        ),
      ],
    };
  }

  return { ...boss, phases: [] };
}

const LINKED_PHASE_ENCOUNTERS = [
  { first: "rennala-queen-of-the-full-moon-20300024", second: "rennala-queen-of-the-full-moon-20310024", trigger: "health-depleted" },
  { first: "god-devouring-serpent", second: "rykard-lord-of-blasphemy", trigger: "health-depleted" },
  { first: "beast-clergyman", second: "maliketh-the-black-blade", trigger: "health-percentage", threshold: 50 },
  { first: "radagon-of-the-golden-order", second: "elden-beast", trigger: "health-depleted" },
] as const;

export function applyLinkedBossPhaseProfiles(bosses: BossData[]): BossData[] {
  const byId = new Map(bosses.map((boss) => [boss.id, boss]));

  return bosses.map((boss) => {
    const encounter = LINKED_PHASE_ENCOUNTERS.find(({ first }) => first === boss.id);
    if (!encounter) return boss;
    const second = byId.get(encounter.second);
    if (!second) throw new Error(`Missing linked boss phase ${encounter.second}`);
    const trigger: BossPhase["trigger"] = encounter.trigger === "health-depleted"
      ? { type: "health-depleted" }
      : { type: "health-percentage", threshold: encounter.threshold };

    return {
      ...boss,
      phases: [
        createPhase(boss, `${boss.id}-phase-1`, boss.name, 1, null),
        {
          id: `${second.id}-phase-2`,
          name: second.name,
          phaseNumber: 2,
          trigger,
          health: second.health,
          defense: { ...second.defense },
          absorption: { ...second.absorption, physical: { ...second.absorption.physical } },
        },
      ],
    };
  });
}

function createPhase(
  boss: BossData,
  id: string,
  name: string,
  phaseNumber: number,
  trigger: BossPhase["trigger"],
  override: Partial<Pick<BossPhase, "health" | "defense" | "absorption">> = {},
): BossPhase {
  return {
    id,
    name,
    phaseNumber,
    trigger,
    health: override.health ?? boss.health,
    defense: override.defense ?? { ...boss.defense },
    absorption: override.absorption ?? {
      ...boss.absorption,
      physical: { ...boss.absorption.physical },
    },
  };
}
