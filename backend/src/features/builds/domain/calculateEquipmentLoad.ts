export type EquipmentLoadCategory = "light" | "medium" | "heavy" | "overloaded";

interface EquipmentLoadInput {
  armorWeight: number;
  talismanWeights: number[];
  weaponWeights: number[];
  maxEquipLoad: number;
}

export function calculateEquipmentLoad(input: EquipmentLoadInput) {
  if (input.maxEquipLoad <= 0) throw new Error("Maximum equip load must be positive");
  const currentLoad = round(input.armorWeight
    + sum(input.talismanWeights)
    + sum(input.weaponWeights));
  const loadRatio = currentLoad / input.maxEquipLoad;
  return {
    currentLoad,
    maxEquipLoad: input.maxEquipLoad,
    loadRatio: round(loadRatio),
    loadPercentage: round(loadRatio * 100),
    category: category(loadRatio),
  };
}

function category(ratio: number): EquipmentLoadCategory {
  if (ratio < 0.3) return "light";
  if (ratio < 0.7) return "medium";
  if (ratio < 1) return "heavy";
  return "overloaded";
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number) {
  return Number(value.toFixed(6));
}
