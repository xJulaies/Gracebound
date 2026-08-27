import type { RegulationWeaponAttackDefinition } from "../mappers/mapRegulationWeaponAttacks";

/**
 * Small verified MVP selection. Behavior labels are intentionally neutral until
 * animation input mappings have also been verified.
 */
export const moonveilAttackDefinitions = [
  {
    id: "katana-attack-100",
    name: "Katana attack 100",
    behaviorVariationId: 900,
    behaviorJudgeId: 100,
  },
  {
    id: "katana-attack-110",
    name: "Katana attack 110",
    behaviorVariationId: 900,
    behaviorJudgeId: 110,
  },
  {
    id: "katana-attack-300",
    name: "Katana attack 300",
    behaviorVariationId: 900,
    behaviorJudgeId: 300,
  },
] as const satisfies readonly RegulationWeaponAttackDefinition[];
