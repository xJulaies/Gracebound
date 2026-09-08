import type { Build, BuildWriteInput, WeaponSlotId } from "../types/build.types";
import type {
  ArmorEditorSlotId,
  BuildEditorDraft,
  WeaponEditorSlotId,
} from "../types/editor.types";

const weaponSlotMap: Record<WeaponEditorSlotId, WeaponSlotId> = {
  "right-hand-1": "rightHand1",
  "right-hand-2": "rightHand2",
  "right-hand-3": "rightHand3",
  "left-hand-1": "leftHand1",
  "left-hand-2": "leftHand2",
  "left-hand-3": "leftHand3",
};

const armorSlotMap: Record<ArmorEditorSlotId, keyof BuildWriteInput["equipment"]["armor"]> = {
  "armor-head": "headId",
  "armor-body": "chestId",
  "armor-arms": "armsId",
  "armor-legs": "legsId",
};

export function toBuildWriteInput(draft: BuildEditorDraft): BuildWriteInput {
  return {
    name: draft.name,
    description: draft.description,
    visibility: draft.visibility,
    characterClassId: draft.characterClassId,
    level: draft.level,
    stats: { ...draft.stats },
    memoryStoneCount: draft.memoryStoneCount,
    spellIds: [...draft.spellIds],
    equipment: {
      weaponSlots: mapRecord(
        draft.weaponSlots,
        weaponSlotMap,
        (selection) => selection ? { ...selection } : null,
      ),
      catalyst: draft.catalyst ? { ...draft.catalyst } : null,
      armor: mapRecord(draft.armor, armorSlotMap, (armorId) => armorId),
      greatRuneId: draft.greatRuneId,
      crystalTearIds: [...draft.crystalTearIds],
      talismanIds: [...draft.talismanIds],
      buffSpellIds: [...draft.buffSpellIds],
      weaponBuff: draft.weaponBuff ? { ...draft.weaponBuff } : null,
    },
  };
}

export function toBuildEditorDraft(build: Build): BuildEditorDraft {
  return {
    name: build.name,
    description: build.description,
    visibility: build.visibility,
    characterClassId: build.characterClassId,
    level: build.level,
    stats: { ...build.stats },
    memoryStoneCount: build.memoryStoneCount,
    spellIds: [...build.spellIds],
    weaponSlots: mapRecord(
      build.equipment.weaponSlots,
      invertMap(weaponSlotMap),
      (selection) => selection ? { ...selection } : null,
    ),
    catalyst: build.equipment.catalyst ? { ...build.equipment.catalyst } : null,
    armor: mapRecord(
      build.equipment.armor,
      invertMap(armorSlotMap),
      (armorId) => armorId,
    ),
    greatRuneId: build.equipment.greatRuneId,
    crystalTearIds: [...build.equipment.crystalTearIds],
    talismanIds: [...build.equipment.talismanIds],
    buffSpellIds: [...build.equipment.buffSpellIds],
    weaponBuff: build.equipment.weaponBuff ? { ...build.equipment.weaponBuff } : null,
  };
}

function mapRecord<
  SourceKey extends string,
  TargetKey extends string,
  Value,
>(
  source: Record<SourceKey, Value>,
  keyMap: Record<SourceKey, TargetKey>,
  copyValue: (value: Value) => Value,
): Record<TargetKey, Value> {
  return Object.fromEntries(
    Object.entries(keyMap).map(([sourceKey, targetKey]) => [
      targetKey,
      copyValue(source[sourceKey as SourceKey]),
    ]),
  ) as Record<TargetKey, Value>;
}

function invertMap<SourceKey extends string, TargetKey extends string>(
  map: Record<SourceKey, TargetKey>,
): Record<TargetKey, SourceKey> {
  return Object.fromEntries(
    Object.entries(map).map(([sourceKey, targetKey]) => [targetKey, sourceKey]),
  ) as Record<TargetKey, SourceKey>;
}
