import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

export interface WildStrikesVariantDefinition {
  weaponType: string;
  motionCategoryId: number;
  definition: RegulationWeaponSkillDefinition;
}

const variants = [
  ["greatsword", 25, 0],
  ["curved-sword", 28, 700],
  ["curved-greatsword", 40, 0],
  ["axe", 30, 1400],
  ["greataxe", 32, 0],
  ["hammer", 33, 1100],
  ["great-hammer", 35, 0],
  ["flail", 34, 1300],
  ["great-katana", 61, 0],
] as const;

export const wildStrikesSkillDefinitions: readonly WildStrikesVariantDefinition[] =
  variants.map(([weaponType, motionCategoryId, behaviorVariationId]) => ({
    weaponType,
    motionCategoryId,
    definition: createDefinition(behaviorVariationId),
  }));

function createDefinition(behaviorVariationId: number): RegulationWeaponSkillDefinition {
  const behavior = (judgeId: number) =>
    300000000 + behaviorVariationId * 1000 + judgeId;

  return {
    id: "wild-strikes",
    swordArtId: 110,
    behaviorVariationId,
    attacks: [
      {
        id: "wild-strikes-loop-1",
        name: "Wild Strikes (Loop 1)",
        fpCostField: "useMagicPoint_L2",
        components: [{ kind: "weapon-hit", sourceBehaviorId: behavior(500), behaviorJudgeId: 500 }],
      },
      {
        id: "wild-strikes-loop-2",
        name: "Wild Strikes (Loop 2)",
        fpCostField: "useMagicPoint_L2",
        components: [{ kind: "weapon-hit", sourceBehaviorId: behavior(510), behaviorJudgeId: 510 }],
      },
      {
        id: "wild-strikes-light-follow-up",
        name: "Wild Strikes (Light Follow-up)",
        fpCostField: "useMagicPoint_R1",
        components: [
          { kind: "weapon-hit", sourceBehaviorId: behavior(501), behaviorJudgeId: 501 },
          { kind: "weapon-hit", sourceBehaviorId: behavior(502), behaviorJudgeId: 502 },
        ],
      },
      {
        id: "wild-strikes-heavy-follow-up",
        name: "Wild Strikes (Heavy Follow-up)",
        fpCostField: "useMagicPoint_R2",
        components: [
          { kind: "weapon-hit", sourceBehaviorId: behavior(503), behaviorJudgeId: 503 },
          { kind: "weapon-hit", sourceBehaviorId: behavior(504), behaviorJudgeId: 504 },
        ],
      },
    ],
  };
}
