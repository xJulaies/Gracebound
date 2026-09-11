import { apiRequest } from "../../../shared/api/apiClient";
import type { CharacterStats } from "../../../shared/types/game.types";
import type { Spell } from "../../spells/types/spell.types";
import type { EquippedWeapon } from "../types/editor.types";
import type { OffensePreviewAction, SpellOffensePreview } from "../types/offensePreview.types";
import {
  damagePreviewResponseSchema,
  spellDamagePreviewRequestSchema,
} from "../schemas/build.schemas";

interface DamageResponse {
  attackRating: { total: number };
  offensiveOutput: { total: number };
}

interface PreviewEquipment {
  crystalTearIds: string[];
  greatRuneId: string | null;
  talismanIds: string[];
  buffSpellIds: string[];
}

export async function getSpellOffensePreview(
  spell: Spell,
  catalyst: EquippedWeapon,
  stats: CharacterStats,
  equipment: PreviewEquipment,
  signal?: AbortSignal,
): Promise<SpellOffensePreview> {
  const castModes = [
    { charged: false, label: "Cast" },
    ...(spell.chargedAttack ? [{ charged: true, label: "Charged cast" }] : []),
  ];
  const actions = await Promise.all(castModes.map(async ({ charged, label }) => {
    const request = spellDamagePreviewRequestSchema.parse({
      spellId: spell.id,
      catalystWeaponId: catalyst.weapon.id,
      catalystVariantId: catalyst.variantId,
      upgradeLevel: catalyst.upgradeLevel,
      charged,
      stats: pickDamageStats(stats),
      talismanIds: equipment.talismanIds,
      greatRuneId: equipment.greatRuneId,
      crystalTearIds: equipment.crystalTearIds,
      buffSpellIds: equipment.buffSpellIds,
    });
    const response = await apiRequest<DamageResponse>("/damage/calculate", {
      body: JSON.stringify(request),
      method: "POST",
      signal,
      responseSchema: damagePreviewResponseSchema,
    });
    const result = response.data[0];
    if (!result) throw new Error("Spell damage preview is unavailable");
    return {
      id: charged ? `${spell.id}-charged` : spell.id,
      label,
      attackRating: result.attackRating.total,
      offensiveOutput: result.offensiveOutput.total,
    } satisfies OffensePreviewAction;
  }));
  return { actions };
}

function pickDamageStats(stats: CharacterStats) {
  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    intelligence: stats.intelligence,
    faith: stats.faith,
    arcane: stats.arcane,
  };
}
