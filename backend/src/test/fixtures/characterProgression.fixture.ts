import type { CharacterProgressionCurves } from "../../features/builds/domain/characterResources.types";

export function createCharacterResourceCurvesFixture(): CharacterProgressionCurves {
  const curve = (value: number) => Array<number>(100).fill(value);
  const progressionCurve = (value: number) => Array<number>(793).fill(value);
  const statusCurves = (value: number) => ({
    poison: progressionCurve(value), rot: progressionCurve(value),
    bleed: progressionCurve(value), frost: progressionCurve(value),
    sleep: progressionCurve(value), madness: progressionCurve(value),
    deathBlight: progressionCurve(value),
  });
  return {
    maxHp: curve(1704),
    maxFp: curve(173),
    maxStamina: curve(121),
    maxEquipLoad: curve(72),
    levelDefense: progressionCurve(100),
    physicalDefense: progressionCurve(10),
    magicDefense: progressionCurve(20),
    fireDefense: progressionCurve(15),
    holyDefense: progressionCurve(20),
    itemDiscovery: progressionCurve(1.3),
    statusLevel: statusCurves(100),
    statusAttribute: statusCurves(10),
  };
}
