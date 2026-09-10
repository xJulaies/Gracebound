import type { Boss } from "../../bosses/types/boss.types";

export function createActiveBossProfile(
  boss: Boss,
  activePhase: NonNullable<Boss["phases"]>[number] | undefined,
  currentMaximumHealth: number,
): Boss {
  if (!activePhase) return boss;

  return {
    ...boss,
    name: activePhase.name,
    imageUrl: activePhase.imageUrl ?? boss.imageUrl,
    health: currentMaximumHealth,
    defense: activePhase.defense,
    absorption: activePhase.absorption,
  };
}
