import type {
  BossAbsorption,
  BossData,
  BossPhase,
  BossPhaseTrigger,
} from "../../../features/bosses/domain/boss.types";

interface BossPhaseDefinition {
  id: string;
  name: string;
  trigger: BossPhaseTrigger | null;
  healthMultiplier?: number;
  absorption?: BossAbsorption;
}

interface InlineBossPhaseProfile {
  bossId: string;
  baseAbsorption?: BossAbsorption;
  phases: readonly BossPhaseDefinition[];
}

interface LinkedBossPhaseProfile {
  firstBossId: string;
  secondBossId: string;
  trigger: BossPhaseTrigger;
}

const GODFREY_PHASE_ONE_ABSORPTION: BossAbsorption = {
  physical: { standard: 10, slash: 10, strike: 10, pierce: 0 },
  magic: 20,
  fire: 20,
  lightning: 0,
  holy: 40,
};

const INLINE_BOSS_PHASE_PROFILES: readonly InlineBossPhaseProfile[] = [
  {
    bossId: "godfrey-first-elden-lord-47210070",
    baseAbsorption: GODFREY_PHASE_ONE_ABSORPTION,
    phases: [
      {
        id: "godfrey",
        name: "Godfrey, First Elden Lord",
        trigger: null,
        absorption: GODFREY_PHASE_ONE_ABSORPTION,
      },
      {
        id: "hoarah-loux",
        name: "Hoarah Loux, Warrior",
        trigger: { type: "health-percentage", threshold: 50 },
      },
    ],
  },
  {
    bossId: "malenia-blade-of-miquella",
    phases: [
      {
        id: "blade-of-miquella",
        name: "Malenia, Blade of Miquella",
        trigger: null,
      },
      {
        id: "goddess-of-rot",
        name: "Malenia, Goddess of Rot",
        trigger: { type: "health-depleted" },
        healthMultiplier: 0.8,
      },
    ],
  },
];

const LINKED_BOSS_PHASE_PROFILES: readonly LinkedBossPhaseProfile[] = [
  {
    firstBossId: "rennala-queen-of-the-full-moon-20300024",
    secondBossId: "rennala-queen-of-the-full-moon-20310024",
    trigger: { type: "health-depleted" },
  },
  {
    firstBossId: "god-devouring-serpent",
    secondBossId: "rykard-lord-of-blasphemy",
    trigger: { type: "health-depleted" },
  },
  {
    firstBossId: "beast-clergyman",
    secondBossId: "maliketh-the-black-blade",
    trigger: { type: "health-percentage", threshold: 50 },
  },
  {
    firstBossId: "radagon-of-the-golden-order",
    secondBossId: "elden-beast",
    trigger: { type: "health-depleted" },
  },
];

export const BOSS_PHASE_PROFILE_PROVENANCE = {
  inlineProfiles: INLINE_BOSS_PHASE_PROFILES,
  linkedProfiles: LINKED_BOSS_PHASE_PROFILES,
} as const;

/**
 * Encounter-level phase data that cannot be recovered from a single NpcParam row.
 * Regulation uses the same NPC row for these transformations; keeping the
 * exceptions here makes the provenance explicit and prevents UI-only fixes.
 */
export function applyBossPhaseProfile(boss: BossData): BossData {
  const profile = INLINE_BOSS_PHASE_PROFILES.find(
    ({ bossId }) => bossId === boss.id,
  );
  if (!profile) return { ...boss, phases: [] };

  return {
    ...boss,
    absorption: cloneAbsorption(profile.baseAbsorption ?? boss.absorption),
    phases: profile.phases.map((phase, index) =>
      createPhase(boss, phase, index + 1),
    ),
  };
}

export function applyLinkedBossPhaseProfiles(bosses: BossData[]): BossData[] {
  const byId = new Map(bosses.map((boss) => [boss.id, boss]));

  return bosses.map((boss) => {
    const profile = LINKED_BOSS_PHASE_PROFILES.find(
      ({ firstBossId }) => firstBossId === boss.id,
    );
    if (!profile) return boss;
    const second = byId.get(profile.secondBossId);
    if (!second) {
      throw new Error(`Missing linked boss phase ${profile.secondBossId}`);
    }

    return {
      ...boss,
      phases: [
        createPhase(
          boss,
          { id: `${boss.id}-phase-1`, name: boss.name, trigger: null },
          1,
        ),
        {
          id: `${second.id}-phase-2`,
          name: second.name,
          phaseNumber: 2,
          trigger: cloneTrigger(profile.trigger),
          health: second.health,
          defense: { ...second.defense },
          absorption: cloneAbsorption(second.absorption),
        },
      ],
    };
  });
}

function createPhase(
  boss: BossData,
  definition: BossPhaseDefinition,
  phaseNumber: number,
): BossPhase {
  return {
    id: definition.id,
    name: definition.name,
    phaseNumber,
    trigger: definition.trigger === null
      ? null
      : cloneTrigger(definition.trigger),
    health: definition.healthMultiplier === undefined
      ? boss.health
      : Math.floor(boss.health * definition.healthMultiplier),
    defense: { ...boss.defense },
    absorption: cloneAbsorption(definition.absorption ?? boss.absorption),
  };
}

function cloneTrigger(trigger: BossPhaseTrigger): BossPhaseTrigger {
  return trigger.type === "health-percentage"
    ? { type: trigger.type, threshold: trigger.threshold }
    : { type: trigger.type };
}

function cloneAbsorption(absorption: BossAbsorption): BossAbsorption {
  return {
    ...absorption,
    physical: { ...absorption.physical },
  };
}
