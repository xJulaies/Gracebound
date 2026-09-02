import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

export interface VerifiedAshOfWarSkillDefinition {
  sourceGemId: number;
  definition: RegulationWeaponSkillDefinition;
}

export const standardAshOfWarSkillDefinitions = [
  {
    sourceGemId: 10500,
    definition: {
      id: "charge-forth",
      swordArtId: 105,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "charge-forth-full",
          name: "Charge Forth (Full)",
          fpCostField: "useMagicPoint_L2",
          components: [270, 271, 272, 273, 274].map((behaviorJudgeId) => ({
            kind: "weapon-hit" as const,
            sourceBehaviorId: 300000000 + behaviorJudgeId,
            behaviorJudgeId,
          })),
        },
        {
          id: "charge-forth-early-release",
          name: "Charge Forth (Early Release)",
          fpCostField: "useMagicPoint_L2",
          components: [273, 275].map((behaviorJudgeId) => ({
            kind: "weapon-hit" as const,
            sourceBehaviorId: 300000000 + behaviorJudgeId,
            behaviorJudgeId,
          })),
        },
      ],
    },
  },
  {
    sourceGemId: 10000,
    definition: {
      id: "lions-claw",
      swordArtId: 100,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "lions-claw",
          name: "Lion's Claw",
          fpCostField: "useMagicPoint_L2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000000, behaviorJudgeId: 0 }],
        },
      ],
    },
  },
  {
    sourceGemId: 10100,
    definition: {
      id: "impaling-thrust",
      swordArtId: 101,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "impaling-thrust",
          name: "Impaling Thrust",
          fpCostField: "useMagicPoint_L2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000010, behaviorJudgeId: 10 }],
        },
      ],
    },
  },
  {
    sourceGemId: 10200,
    definition: {
      id: "piercing-fang",
      swordArtId: 102,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "piercing-fang",
          name: "Piercing Fang",
          fpCostField: "useMagicPoint_L2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000012, behaviorJudgeId: 12 }],
        },
      ],
    },
  },
  {
    sourceGemId: 10600,
    definition: {
      id: "stamp-upward-cut",
      swordArtId: 106,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "upward-cut",
          name: "Upward Cut",
          fpCostField: "useMagicPoint_R2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000290, behaviorJudgeId: 290 }],
        },
      ],
    },
  },
  {
    sourceGemId: 10700,
    definition: {
      id: "stamp-sweep",
      swordArtId: 107,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "sweep",
          name: "Sweep",
          fpCostField: "useMagicPoint_R2",
          components: [
            { kind: "weapon-hit", sourceBehaviorId: 300000890, behaviorJudgeId: 890 },
            { kind: "weapon-hit", sourceBehaviorId: 300000891, behaviorJudgeId: 891 },
          ],
        },
      ],
    },
  },
  {
    sourceGemId: 11600,
    definition: {
      id: "giant-hunt",
      swordArtId: 116,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "giant-hunt",
          name: "Giant Hunt",
          fpCostField: "useMagicPoint_L2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000150, behaviorJudgeId: 150 }],
        },
      ],
    },
  },
  {
    sourceGemId: 21600,
    definition: {
      id: "thunderbolt",
      swordArtId: 216,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "thunderbolt",
          name: "Thunderbolt",
          fpCostField: "useMagicPoint_L2",
          components: [{ kind: "projectile", sourceBehaviorId: 300000350, behaviorJudgeId: 350 }],
        },
      ],
    },
  },
  {
    sourceGemId: 11400,
    definition: {
      id: "unsheathe",
      swordArtId: 114,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "unsheathe-light",
          name: "Unsheathe (Light)",
          fpCostField: "useMagicPoint_R1",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000560, behaviorJudgeId: 560 }],
        },
        {
          id: "unsheathe-heavy",
          name: "Unsheathe (Heavy)",
          fpCostField: "useMagicPoint_R2",
          components: [{ kind: "weapon-hit", sourceBehaviorId: 300000565, behaviorJudgeId: 565 }],
        },
      ],
    },
  },
] as const satisfies readonly VerifiedAshOfWarSkillDefinition[];
