import { useMemo, useState } from "react";
import type { Armor } from "../../armor/types/armor.types";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { CrystalTear } from "../../crystal-tears/types/crystalTear.types";
import type { GreatRune } from "../../great-runes/types/greatRune.types";
import type { Spell } from "../../spells/types/spell.types";
import type { Talisman } from "../../talismans/types/talisman.types";
import type { CharacterStats } from "../../../shared/types/game.types";
import type {
  ActiveWeaponBuff,
  BuildEditorDraft,
  BuildEditorInitialState,
  BuildEditorMetadata,
  EquippedWeapon,
  WeaponEditorSlotId,
} from "../types/editor.types";

const weaponSlotIds: WeaponEditorSlotId[] = [
  "right-hand-1", "right-hand-2", "right-hand-3",
  "left-hand-1", "left-hand-2", "left-hand-3",
];

const armorSlotIds = ["armor-head", "armor-body", "armor-arms", "armor-legs"] as const;
const talismanSlotIds = ["talisman-1", "talisman-2", "talisman-3", "talisman-4"];
const crystalTearSlotIds = ["crystal-tear-1", "crystal-tear-2"];

export function useBuildEditorDraft(initialState?: BuildEditorInitialState) {
  const initialDraft = initialState?.draft;
  const [savedDraftSignature, setSavedDraftSignature] = useState<string | null>(
    initialDraft ? JSON.stringify(initialDraft) : null,
  );
  const [metadata, setMetadata] = useState<BuildEditorMetadata>(() => initialDraft ? {
    name: initialDraft.name,
    description: initialDraft.description,
    visibility: initialDraft.visibility,
  } : {
    name: "Untitled build",
    description: "",
    visibility: "private",
  });
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(initialState?.selectedClass ?? null);
  const [stats, setStats] = useState<CharacterStats | null>(() => initialDraft ? { ...initialDraft.stats } : null);
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, EquippedWeapon>>(() => initialState?.selectedWeapons ?? {});
  const [selectedArmor, setSelectedArmor] = useState<Record<string, Armor>>(() => initialState?.selectedArmor ?? {});
  const [selectedTalismans, setSelectedTalismans] = useState<Record<string, Talisman>>(() => initialState?.selectedTalismans ?? {});
  const [selectedGreatRune, setSelectedGreatRune] = useState<GreatRune | null>(initialState?.selectedGreatRune ?? null);
  const [selectedCrystalTears, setSelectedCrystalTears] = useState<Record<string, CrystalTear>>(() => initialState?.selectedCrystalTears ?? {});
  const [selectedSpells, setSelectedSpells] = useState<Record<number, Spell>>(() => initialState?.selectedSpells ?? {});
  const [memoryStoneCount, setMemoryStoneCount] = useState(initialDraft?.memoryStoneCount ?? 0);
  const [activeCatalystSlotId, setActiveCatalystSlotId] = useState<WeaponEditorSlotId | null>(initialState?.activeCatalystSlotId ?? null);
  const [activeBuffSpellIds, setActiveBuffSpellIds] = useState<string[]>(() => initialDraft ? [...initialDraft.buffSpellIds] : []);
  const [activeWeaponBuff, setActiveWeaponBuff] = useState<ActiveWeaponBuff | null>(initialState?.activeWeaponBuff ?? null);

  const characterLevel = selectedClass && stats
    ? selectedClass.level + Object.keys(stats).reduce(
        (total, attribute) => total + stats[attribute as keyof CharacterStats]
          - selectedClass.stats[attribute as keyof CharacterStats],
        0,
      )
    : 0;

  const draft = useMemo<BuildEditorDraft | null>(() => {
    if (!selectedClass || !stats) return null;

    const activeCatalyst = activeCatalystSlotId
      ? selectedWeapons[activeCatalystSlotId]
      : undefined;

    return {
      ...metadata,
      characterClassId: selectedClass.id,
      level: characterLevel,
      stats: { ...stats },
      memoryStoneCount,
      spellIds: Object.entries(selectedSpells)
        .sort(([left], [right]) => Number(left) - Number(right))
        .map(([, spell]) => spell.id),
      weaponSlots: Object.fromEntries(weaponSlotIds.map((slotId) => {
        const selection = selectedWeapons[slotId];
        return [slotId, selection ? {
          weaponId: selection.weapon.id,
          variantId: selection.variantId,
          upgradeLevel: selection.upgradeLevel,
          ashOfWarId: selection.ashOfWarId,
        } : null];
      })) as BuildEditorDraft["weaponSlots"],
      catalyst: activeCatalyst && activeCatalyst.weapon.castingTypes.length > 0
        ? {
            weaponId: activeCatalyst.weapon.id,
            variantId: activeCatalyst.variantId,
            upgradeLevel: activeCatalyst.upgradeLevel,
          }
        : null,
      armor: Object.fromEntries(armorSlotIds.map((slotId) => [
        slotId,
        selectedArmor[slotId]?.id ?? null,
      ])) as BuildEditorDraft["armor"],
      greatRuneId: selectedGreatRune?.id ?? null,
      crystalTearIds: crystalTearSlotIds.flatMap((slotId) =>
        selectedCrystalTears[slotId]?.id ?? [],
      ),
      talismanIds: talismanSlotIds.flatMap((slotId) =>
        selectedTalismans[slotId]?.id ?? [],
      ),
      buffSpellIds: [...activeBuffSpellIds],
      weaponBuff: createWeaponBuffSelection(
        activeWeaponBuff,
        selectedSpells,
        selectedWeapons,
      ),
    };
  }, [
    activeBuffSpellIds,
    activeCatalystSlotId,
    activeWeaponBuff,
    characterLevel,
    memoryStoneCount,
    metadata,
    selectedArmor,
    selectedClass,
    selectedCrystalTears,
    selectedGreatRune,
    selectedSpells,
    selectedTalismans,
    selectedWeapons,
    stats,
  ]);

  const draftSignature = draft ? JSON.stringify(draft) : null;
  const isDirty = draftSignature !== null && draftSignature !== savedDraftSignature;

  const markSaved = (savedDraft: BuildEditorDraft) => {
    setSavedDraftSignature(JSON.stringify(savedDraft));
  };

  return {
    draft,
    isDirty,
    markSaved,
    metadata, setMetadata,
    characterLevel,
    selectedClass, setSelectedClass,
    stats, setStats,
    selectedWeapons, setSelectedWeapons,
    selectedArmor, setSelectedArmor,
    selectedTalismans, setSelectedTalismans,
    selectedGreatRune, setSelectedGreatRune,
    selectedCrystalTears, setSelectedCrystalTears,
    selectedSpells, setSelectedSpells,
    memoryStoneCount, setMemoryStoneCount,
    activeCatalystSlotId, setActiveCatalystSlotId,
    activeBuffSpellIds, setActiveBuffSpellIds,
    activeWeaponBuff, setActiveWeaponBuff,
  };
}

function createWeaponBuffSelection(
  activeWeaponBuff: ActiveWeaponBuff | null,
  selectedSpells: Record<number, Spell>,
  selectedWeapons: Record<string, EquippedWeapon>,
) {
  if (!activeWeaponBuff) return null;
  const spellExists = Object.values(selectedSpells).some(
    ({ id }) => id === activeWeaponBuff.spellId,
  );
  const catalyst = selectedWeapons[activeWeaponBuff.catalystSlotId];
  if (!spellExists || !catalyst) return null;

  return {
    spellId: activeWeaponBuff.spellId,
    catalystWeaponId: catalyst.weapon.id,
    catalystVariantId: catalyst.variantId,
    upgradeLevel: catalyst.upgradeLevel,
  };
}
