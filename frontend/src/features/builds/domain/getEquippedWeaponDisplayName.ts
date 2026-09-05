import type { EquippedWeapon } from "../types/editor.types";

export function getEquippedWeaponDisplayName(selection: EquippedWeapon) {
  const affinity = selection.weapon.variants.find(
    ({ id }) => id === selection.variantId,
  )?.affinity;
  const prefix = affinity ? `${formatAffinity(affinity)} ` : "";

  return `${prefix}${selection.weapon.name} +${selection.upgradeLevel}`;
}

function formatAffinity(affinity: string) {
  return affinity
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
