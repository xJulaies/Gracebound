export const DAMAGE_TYPES = ["physical", "magic", "fire", "lightning", "holy"] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export function isDamageType(value: string): value is DamageType {
  return DAMAGE_TYPES.some((type) => type === value);
}
