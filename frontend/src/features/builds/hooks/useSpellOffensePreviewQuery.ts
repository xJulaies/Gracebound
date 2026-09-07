import { useQuery } from "@tanstack/react-query";
import type { CharacterStats } from "../../../shared/types/game.types";
import type { Spell } from "../../spells/types/spell.types";
import { getSpellOffensePreview } from "../api/spellDamagePreview.api";
import type { EquippedWeapon } from "../types/editor.types";

interface PreviewEquipment {
  crystalTearIds: string[];
  greatRuneId: string | null;
  talismanIds: string[];
  buffSpellIds: string[];
}

export function useSpellOffensePreviewQuery(
  spell: Spell | null,
  catalyst: EquippedWeapon | null,
  stats: CharacterStats | null,
  equipment: PreviewEquipment,
) {
  const enabled = spell?.calculationStatus === "supported"
    && spell.attack !== null
    && catalyst !== null
    && stats !== null
    && catalyst.weapon.castingTypes.includes(spell.type);
  const query = useQuery({
    queryKey: ["spell-offense-preview", spell, catalyst, stats, equipment],
    queryFn: ({ signal }) => getSpellOffensePreview(spell!, catalyst!, stats!, equipment, signal),
    enabled,
  });
  return { ...query, isPending: enabled && query.isPending };
}
