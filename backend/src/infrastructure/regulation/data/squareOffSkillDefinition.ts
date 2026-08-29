import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

export const squareOffSkillDefinition = {
  id: "square-off",
  swordArtId: 115,
  behaviorVariationId: 0,
  attacks: [
    {
      id: "square-off-light",
      name: "Square Off (Light)",
      fpCostField: "useMagicPoint_R1",
      components: [{ kind: "weapon-hit", sourceBehaviorId: 300000700, behaviorJudgeId: 700 }],
    },
    {
      id: "square-off-heavy",
      name: "Square Off (Heavy)",
      fpCostField: "useMagicPoint_R2",
      components: [{ kind: "weapon-hit", sourceBehaviorId: 300000705, behaviorJudgeId: 705 }],
    },
  ],
} as const satisfies RegulationWeaponSkillDefinition;
