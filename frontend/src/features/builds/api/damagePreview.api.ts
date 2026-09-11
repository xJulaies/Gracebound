import { apiRequest } from "../../../shared/api/apiClient";
import type { CharacterStats } from "../../../shared/types/game.types";
import type { EquippedWeapon } from "../types/editor.types";
import type { WeaponBuffSelection } from "../types/build.types";
import type { OffensePreviewAction, WeaponOffensePreview } from "../types/offensePreview.types";
import {
  damagePreviewResponseSchema,
  weaponDamagePreviewRequestSchema,
} from "../schemas/build.schemas";

interface DamageResponse {
  attackRating: { total: number };
  offensiveOutput: { total: number };
}

interface PreviewEquipment {
  armorIds: string[];
  crystalTearIds: string[];
  greatRuneId: string | null;
  talismanIds: string[];
  buffSpellIds: string[];
  weaponBuff: WeaponBuffSelection | null;
  skillBuffAshOfWarId: string | null;
}

export async function getWeaponOffensePreview(
  weapon: EquippedWeapon,
  stats: CharacterStats,
  equipment: PreviewEquipment,
  signal?: AbortSignal,
): Promise<WeaponOffensePreview> {
  const actions = selectPreviewActions(weapon);
  const results = await Promise.all(actions.map(async ({ id, kind, label }) => {
    const request = weaponDamagePreviewRequestSchema.parse({
      weaponId: weapon.weapon.id,
      weaponVariantId: weapon.variantId,
      upgradeLevel: weapon.upgradeLevel,
      stats: pickDamageStats(stats),
      armorIds: equipment.armorIds,
      talismanIds: equipment.talismanIds,
      greatRuneId: equipment.greatRuneId,
      crystalTearIds: equipment.crystalTearIds,
      buffSpellIds: equipment.buffSpellIds,
      weaponBuff: equipment.weaponBuff,
      skillBuffAshOfWarId: equipment.skillBuffAshOfWarId,
      [kind]: id,
    });
    const response = await apiRequest<DamageResponse>("/damage/calculate", {
      body: JSON.stringify(request),
      method: "POST",
      signal,
      responseSchema: damagePreviewResponseSchema,
    });
    const result = response.data[0];
    if (!result) throw new Error("Damage preview is unavailable");
    return {
      id,
      label,
      attackRating: result.attackRating.total,
      offensiveOutput: result.offensiveOutput.total,
    } satisfies OffensePreviewAction;
  }));
  return { actions: results };
}

function selectPreviewActions(weapon: EquippedWeapon) {
  const attacks = weapon.weapon.attacks;
  const candidates = [
    { label: "Light attack (R1)", attack: findAttack(attacks, ["1h-light-1"], ["light attack 1"]) },
    { label: "Heavy attack (R2)", attack: findAttack(attacks, ["1h-heavy-1"], ["heavy attack 1"], ["charged"]) },
    { label: "Charged heavy attack", attack: findAttack(attacks, ["charged-heavy"], ["charged heavy"]) },
    { label: "Jump attack", attack: findAttack(attacks, ["jumping-heavy", "jumping-light"], ["jumping heavy", "jumping light", "jump attack"]) },
  ];
  const normalActions = candidates
    .filter((candidate): candidate is { label: string; attack: { id: string; name: string } } => Boolean(candidate.attack))
    .map(({ attack, label }) => ({ id: attack.id, kind: "attackId" as const, label }));
  const skill = weapon.weapon.skills[0]?.attacks[0];
  return skill
    ? [...normalActions, { id: skill.id, kind: "skillAttackId" as const, label: "Skill" }]
    : normalActions;
}

function findAttack(
  attacks: Array<{ id: string; name: string }>,
  idPatterns: string[],
  namePatterns: string[],
  excludedPatterns: string[] = [],
) {
  return attacks.find(({ id, name }) => {
    const normalizedName = name.toLocaleLowerCase();
    const matches = idPatterns.some((pattern) => id.includes(pattern))
      || namePatterns.some((pattern) => normalizedName.includes(pattern));
    return matches && !excludedPatterns.some((pattern) => id.includes(pattern) || normalizedName.includes(pattern));
  });
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
