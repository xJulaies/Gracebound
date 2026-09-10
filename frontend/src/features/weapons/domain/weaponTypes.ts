export const WEAPON_TYPE_ORDER = [
  "dagger",
  "straight-sword",
  "greatsword",
  "colossal-sword",
  "light-greatsword",
  "thrusting-sword",
  "heavy-thrusting-sword",
  "curved-sword",
  "curved-greatsword",
  "katana",
  "great-katana",
  "twinblade",
  "axe",
  "greataxe",
  "hammer",
  "flail",
  "great-hammer",
  "colossal-weapon",
  "spear",
  "great-spear",
  "halberd",
  "reaper",
  "whip",
  "fist",
  "hand-to-hand",
  "claw",
  "beast-claw",
  "backhand-blade",
  "perfume-bottle",
  "light-bow",
  "bow",
  "greatbow",
  "crossbow",
  "ballista",
  "glintstone-staff",
  "sacred-seal",
  "small-shield",
  "medium-shield",
  "greatshield",
  "thrusting-shield",
  "torch",
] as const;

export function formatWeaponType(weaponType: string | null) {
  if (!weaponType) return "Unknown armament type";
  return weaponType
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
