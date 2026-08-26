export function calculateScaledBossHealth(
  baseHealth: number,
  healthMultiplier: number,
): number {
  return Math.floor(baseHealth * healthMultiplier);
}
