import { getAshOfWar } from "../../ashes-of-war/api/ashesOfWar.api";
import { getSpell } from "../../spells/api/spells.api";
import type { Spell } from "../../spells/types/spell.types";
import { getWeapon } from "../../weapons/api/weapons.api";
import type { Weapon } from "../../weapons/types/weapon.types";
import type { Build, WeaponSelection, WeaponSlotId } from "../../builds/types/build.types";
import type { DamageTrialActionOption } from "../types/damageTrial.types";

const weaponSlots: WeaponSlotId[] = [
  "rightHand1", "rightHand2", "rightHand3", "leftHand1", "leftHand2", "leftHand3",
];

export async function getDamageTrialActionOptions(build: Build): Promise<DamageTrialActionOption[]> {
  const equippedWeapons = weaponSlots.flatMap((slotId) => {
    const selection = build.equipment.weaponSlots[slotId];
    return selection ? [{ selection, slotId }] : [];
  });
  const catalystRequest = build.equipment.catalyst
    ? getWeapon(build.equipment.catalyst.weaponId)
    : null;
  const [weaponOptions, catalystResponse, spells] = await Promise.all([
    Promise.all(equippedWeapons.map(({ selection, slotId }) => getWeaponOptions(selection, slotId))),
    catalystRequest,
    Promise.all(build.spellIds.map(async (spellId) => getFirst((await getSpell(spellId)).data, "spell"))),
  ]);
  const catalyst = catalystResponse ? getFirst(catalystResponse.data, "catalyst") : null;
  const catalystSlotId = build.equipment.catalyst
    ? equippedWeapons.find(({ selection }) => (
        selection.weaponId === build.equipment.catalyst?.weaponId
        && selection.variantId === build.equipment.catalyst.variantId
        && selection.upgradeLevel === build.equipment.catalyst.upgradeLevel
      ))?.slotId
    : undefined;
  const catalystSourceId = catalystSlotId
    ? `armament:${catalystSlotId}`
    : catalyst ? `catalyst:${catalyst.id}` : null;
  const spellOptions = catalyst
    ? spells
        .filter((spell) => catalyst.castingTypes.includes(spell.type))
        .flatMap((spell) => getSpellOptions(spell, {
          id: catalystSourceId!,
          label: catalyst.name,
          iconUrl: catalyst.iconUrl,
          detail: catalystSlotId ? formatWeaponSlot(catalystSlotId) : "Catalyst",
        }))
    : [];

  return [...weaponOptions.flat(), ...spellOptions];
}

async function getWeaponOptions(
  selection: WeaponSelection,
  slotId: WeaponSlotId,
): Promise<DamageTrialActionOption[]> {
  const [weaponResponse, ashResponse] = await Promise.all([
    getWeapon(selection.weaponId),
    selection.ashOfWarId ? getAshOfWar(selection.ashOfWarId) : null,
  ]);
  const weapon = getFirst(weaponResponse.data, "armament");
  const affinity = weapon.variants.find(({ id }) => id === selection.variantId)?.affinity;
  const sourceName = `${formatAffinity(affinity)}${weapon.name} +${selection.upgradeLevel}`;
  const actions = selectWeaponAttacks(weapon);
  const ashOfWar = ashResponse ? getFirst(ashResponse.data, "Ash of War") : null;
  const skills = ashOfWar?.attacks.length
    ? ashOfWar.attacks.map((attack) => ({ id: attack.id, label: ashOfWar.name }))
    : weapon.skills.flatMap((skill) => skill.attacks.map((attack) => ({
        id: attack.id,
        label: skill.name,
      })));

  return [
    ...actions.map(({ id, label }) => ({
      id: `${slotId}:attack:${id}`,
      sourceId: `armament:${slotId}`,
      sourceLabel: sourceName,
      sourceIconUrl: weapon.iconUrl,
      sourceDetail: formatWeaponSlot(slotId),
      action: { kind: "weapon-attack" as const, weaponSlotId: slotId, attackId: id, label, skillBuffActive: false },
      sourceName,
      iconUrl: weapon.iconUrl,
      detail: formatWeaponSlot(slotId),
      group: "armament" as const,
    })),
    ...skills.map(({ id, label }) => ({
      id: `${slotId}:skill:${id}`,
      sourceId: `armament:${slotId}`,
      sourceLabel: sourceName,
      sourceIconUrl: weapon.iconUrl,
      sourceDetail: formatWeaponSlot(slotId),
      action: { kind: "weapon-skill" as const, weaponSlotId: slotId, skillAttackId: id, label, skillBuffActive: false },
      sourceName,
      iconUrl: ashOfWar?.iconUrl ?? weapon.iconUrl,
      detail: `Skill · ${formatWeaponSlot(slotId)}`,
      group: "armament" as const,
    })),
  ];
}

function getSpellOptions(spell: Spell, source: { id: string; label: string; iconUrl: string; detail: string }): DamageTrialActionOption[] {
  if (!spell.attack || spell.calculationStatus !== "supported") return [];
  return [
    createSpellOption(spell, false, source),
    ...(spell.chargedAttack ? [createSpellOption(spell, true, source)] : []),
  ];
}

function createSpellOption(
  spell: Spell,
  charged: boolean,
  source: { id: string; label: string; iconUrl: string; detail: string },
): DamageTrialActionOption {
  const label = charged ? "Charged cast" : "Cast";
  return {
    id: `spell:${spell.id}:${charged ? "charged" : "normal"}`,
    sourceId: source.id,
    sourceLabel: source.label,
    sourceIconUrl: source.iconUrl,
    sourceDetail: source.detail,
    action: { kind: "spell", spellId: spell.id, label, charged },
    sourceName: spell.name,
    iconUrl: spell.iconUrl,
    detail: `${spell.type === "sorcery" ? "Sorcery" : "Incantation"} · ${charged ? spell.chargedFpCost ?? spell.fpCost : spell.fpCost} FP`,
    group: "spell",
  };
}

function selectWeaponAttacks(weapon: Weapon) {
  const candidates = [
    { label: "Light attack (R1)", attack: findAttack(weapon.attacks, ["1h-light-1"], ["light attack 1"]) },
    { label: "Heavy attack (R2)", attack: findAttack(weapon.attacks, ["1h-heavy-1"], ["heavy attack 1"], ["charged"]) },
    { label: "Charged heavy attack", attack: findAttack(weapon.attacks, ["charged-heavy"], ["charged heavy"]) },
    { label: "Jump attack", attack: findAttack(weapon.attacks, ["jumping-heavy", "jumping-light"], ["jumping heavy", "jumping light", "jump attack"]) },
  ];
  return candidates
    .filter((candidate): candidate is { label: string; attack: { id: string; name: string } } => Boolean(candidate.attack))
    .map(({ attack, label }) => ({ id: attack.id, label }));
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

function formatAffinity(affinity: string | undefined) {
  if (!affinity || affinity.toLocaleLowerCase() === "standard") return "";
  return `${affinity.charAt(0).toUpperCase()}${affinity.slice(1)} `;
}

function formatWeaponSlot(slotId: WeaponSlotId) {
  const match = slotId.match(/^(right|left)Hand(\d)$/);
  return match ? `${match[1] === "right" ? "Right" : "Left"} hand ${match[2]}` : slotId;
}

function getFirst<T>(items: T[], label: string): T {
  const item = items[0];
  if (!item) throw new Error(`The saved ${label} is unavailable.`);
  return item;
}
