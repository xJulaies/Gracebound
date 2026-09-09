import type { Armor } from "../../armor/types/armor.types";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { CrystalTear } from "../../crystal-tears/types/crystalTear.types";
import type { GreatRune } from "../../great-runes/types/greatRune.types";
import type { Spell } from "../../spells/types/spell.types";
import type { Talisman } from "../../talismans/types/talisman.types";
import type { CharacterStats } from "../../../shared/types/game.types";
import type {
  BuildEditorFocus,
  EquippedWeapon,
  WeaponEditorSlotId,
} from "../types/editor.types";
import { useBuildStatsPreviewQuery } from "./useBuildStatsPreviewQuery";
import { useSpellOffensePreviewQuery } from "./useSpellOffensePreviewQuery";
import { useWeaponOffensePreviewQuery } from "./useWeaponOffensePreviewQuery";

interface BuildEditorPreviewOptions {
  activeCatalystSlotId: WeaponEditorSlotId | null;
  editorFocus: BuildEditorFocus | null;
  isGreatRuneActive: boolean;
  isPhysickActive: boolean;
  memoryStoneCount: number;
  selectedArmor: Record<string, Armor>;
  selectedClass: CharacterClass | null;
  selectedCrystalTears: Record<string, CrystalTear>;
  selectedGreatRune: GreatRune | null;
  selectedSpells: Record<number, Spell>;
  selectedTalismans: Record<string, Talisman>;
  selectedWeapons: Record<string, EquippedWeapon>;
  stats: CharacterStats | null;
}

export function useBuildEditorPreviews({
  activeCatalystSlotId,
  editorFocus,
  isGreatRuneActive,
  isPhysickActive,
  memoryStoneCount,
  selectedArmor,
  selectedClass,
  selectedCrystalTears,
  selectedGreatRune,
  selectedSpells,
  selectedTalismans,
  selectedWeapons,
  stats,
}: BuildEditorPreviewOptions) {
  const armorIds = Object.values(selectedArmor).map(({ id }) => id);
  const talismanIds = Object.values(selectedTalismans).map(({ id }) => id);
  const crystalTearIds = isPhysickActive
    ? Object.values(selectedCrystalTears).map(({ id }) => id)
    : [];
  const greatRuneId = isGreatRuneActive ? selectedGreatRune?.id ?? null : null;
  const focusedWeapon = editorFocus?.kind === "weapon"
    ? selectedWeapons[editorFocus.slotId] ?? null
    : null;
  const focusedSpell = editorFocus?.kind === "spell"
    ? selectedSpells[editorFocus.slotIndex] ?? null
    : null;
  const activeCatalyst = activeCatalystSlotId
    ? selectedWeapons[activeCatalystSlotId] ?? null
    : null;
  const focusedWeaponSlotId = editorFocus?.kind === "weapon" ? editorFocus.slotId : null;

  const statsQuery = useBuildStatsPreviewQuery(
    selectedClass && stats
      ? {
          characterClassId: selectedClass.id,
          stats,
          armorIds,
          talismanIds,
          weaponIds: Object.values(selectedWeapons).map(({ weapon }) => weapon.id),
          greatRuneId,
          crystalTearIds,
          memoryStoneCount,
          spellIds: Object.values(selectedSpells).map(({ id }) => id),
          catalyst: toCatalystSelection(activeCatalyst),
        }
      : null,
  );
  const statsPreview = statsQuery.data?.data[0] ?? null;
  const locallyAvailableSpellSlots = 2 + memoryStoneCount;
  const availableSpellSlots = Math.max(
    locallyAvailableSpellSlots,
    statsPreview?.memorySlots.availableSlots ?? locallyAvailableSpellSlots,
  );
  const selectedSpellEntries = Object.entries(selectedSpells);
  const requiredSpellCapacity = Math.max(
    selectedSpellEntries.reduce((total, [, spell]) => total + spell.slotsRequired, 0),
    ...selectedSpellEntries.map(([slot]) => Number(slot)),
    0,
  );
  const nonStoneSlotBonus = Math.max(0, availableSpellSlots - 2 - memoryStoneCount);
  const minimumMemoryStoneCount = Math.max(0, requiredSpellCapacity - 2 - nonStoneSlotBonus);

  const offenseQuery = useWeaponOffensePreviewQuery(focusedWeapon, stats, {
    armorIds,
    talismanIds,
    greatRuneId,
    crystalTearIds,
    buffSpellIds: [],
    weaponBuff: null,
    skillBuffAshOfWarId: null,
  });
  const spellOffenseQuery = useSpellOffensePreviewQuery(
    focusedSpell,
    activeCatalyst,
    stats,
    { talismanIds, greatRuneId, crystalTearIds, buffSpellIds: [] },
  );

  return {
    activeCatalyst,
    availableSpellSlots,
    focusedSpell,
    focusedWeapon,
    focusedWeaponSlotId,
    minimumMemoryStoneCount,
    offenseQuery,
    spellOffenseQuery,
    statsPreview,
    statsQuery,
  };
}

function toCatalystSelection(weapon: EquippedWeapon | null) {
  if (!weapon || weapon.weapon.castingTypes.length === 0) return null;
  return {
    weaponId: weapon.weapon.id,
    variantId: weapon.variantId,
    upgradeLevel: weapon.upgradeLevel,
  };
}
