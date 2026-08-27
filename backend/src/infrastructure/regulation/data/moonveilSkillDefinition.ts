export const moonveilSkillDefinition = {
  id: "transient-moonlight",
  swordArtId: 1178,
  behaviorVariationId: 905,
  attacks: [
    {
      id: "transient-moonlight-light",
      name: "Transient Moonlight (Light)",
      fpCostField: "useMagicPoint_R1",
      projectileBehaviorJudgeId: 900,
      weaponHitBehaviorJudgeId: 901,
    },
    {
      id: "transient-moonlight-heavy",
      name: "Transient Moonlight (Heavy)",
      fpCostField: "useMagicPoint_R2",
      projectileBehaviorJudgeId: 905,
      weaponHitBehaviorJudgeId: 906,
    },
  ],
} as const;
