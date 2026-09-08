import { useQuery } from "@tanstack/react-query";
import type { CharacterStats } from "../../../shared/types/game.types";
import type { EquippedWeapon } from "../types/editor.types";
import { getWeaponOffensePreview } from "../api/damagePreview.api";
import type { WeaponBuffSelection } from "../types/build.types";
import { useDebouncedCharacterStats } from "./useDebouncedCharacterStats";

interface PreviewEquipment {
  armorIds: string[];
  crystalTearIds: string[];
  greatRuneId: string | null;
  talismanIds: string[];
  buffSpellIds: string[];
  weaponBuff: WeaponBuffSelection | null;
  skillBuffAshOfWarId: string | null;
}

export function useWeaponOffensePreviewQuery(
  weapon: EquippedWeapon | null,
  stats: CharacterStats | null,
  equipment: PreviewEquipment,
  debounceMs?: number,
) {
  const debouncedStats = useDebouncedCharacterStats(stats, debounceMs);
  const enabled = weapon !== null
    && debouncedStats !== null
    && (weapon.weapon.attacks.length > 0
      || weapon.weapon.skills.some(({ attacks }) => attacks.length > 0));
  const query = useQuery({
    queryKey: ["weapon-offense-preview", weapon, debouncedStats, equipment],
    queryFn: ({ signal }) => getWeaponOffensePreview(weapon!, debouncedStats!, equipment, signal),
    enabled,
    staleTime: Infinity,
  });
  return { ...query, isPending: enabled && query.isPending };
}
