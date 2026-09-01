import type { SpellData, SpellType } from "../../../features/spells/domain/spell.types";
import type { MagicParamRow } from "../schemas/magic.schema";
import type { AttackParamRow } from "../schemas/weaponAttackParam.schema";
import type { BulletParamRow, FinalDamageRateRow } from "../schemas/weaponSkillParam.schema";
import type { ArmorEffectRow } from "../schemas/armor.schema";

const FIRST_DLC_MAGIC_ID = 2_000_000;
const EXCLUDED_MAGIC_IDS = new Set([4641, 4642, 8000, 8001]);
const TYPE_OVERRIDES = new Map<number, SpellType>([
  [5040, "incantation"],
  [6500, "sorcery"],
]);
const NAME_OVERRIDES = new Map<number, string>([
  [6940, "Ancient Dragons' Lightning Spear"],
  [6941, "Fortissax's Lightning Spear"],
]);
const VERIFIED_DIRECT_PROJECTILE_IDS = new Set([
  4000, 4001, 4010, 4020, 4021, 4400, 4720,
  6010, 6410, 6700, 6900, 7320,
  4300, 4301, 4302, 4721, 6800, 7200,
  4060, 4200, 4520,
  4080, 6100, 7090,
  4090, 6230, 6820, 7310,
  4800, 4820, 5010,
  4500, 6940, 6941,
]);
const VERIFIED_CHARGED_PROJECTILE_IDS = new Set([
  4020, 4021, 4090, 4500, 4721, 4800, 4820, 6010, 6100, 6230, 6410, 6820, 7310, 7320,
]);
const SUSTAINED_SPELL_IDS = new Set([4060, 4200, 4520]);
const HIT_BULLET_DAMAGE_IDS = new Set([4080, 6100]);
const MULTI_COMPONENT_SPELL_IDS = new Set([4500, 4800, 4820, 5010, 6940, 6941]);
const VERIFIED_BUFF_EFFECT_IDS = new Map<number, number>([
  [4460, 1446000], [4490, 1449000], [6050, 1605000], [6250, 1626000],
  [6320, 1632000], [6600, 1660000], [6770, 1677000],
  [6960, 1696000], [6970, 1697000], [7230, 1723000], [7330, 1733000],
]);
const BODY_BUFF_IDS = new Set([6050, 7330]);
const STATUS_WEAPON_BUFF_IDS = new Set([4490, 7230]);

export interface SpellCombatTables {
  bullets: BulletParamRow[];
  attacks: AttackParamRow[];
  finalDamageRates: FinalDamageRateRow[];
  effects: ArmorEffectRow[];
}

export function mapBaseGameSpells(rows: MagicParamRow[], combatTables?: SpellCombatTables): SpellData[] {
  const spells = rows.flatMap((row) => {
    if (row.ID >= FIRST_DLC_MAGIC_ID || EXCLUDED_MAGIC_IDS.has(row.ID)) return [];
    const parsedName = parsePlayerSpellName(row.Name);
    if (!parsedName) return [];
    if (row.slotLength < 1) throw new Error(`Playable spell ${row.Name} has no memory-slot cost`);
    const type = TYPE_OVERRIDES.get(row.ID) ?? parsedName.type;
    const name = NAME_OVERRIDES.get(row.ID) ?? parsedName.name;
    const attack = VERIFIED_DIRECT_PROJECTILE_IDS.has(row.ID)
      ? mapSpellAttack(row.ID, row.Name, false, row.refCategory1, row.refId1, combatTables)
      : null;
    const chargedAttack = VERIFIED_CHARGED_PROJECTILE_IDS.has(row.ID)
      ? mapSpellAttack(row.ID, row.Name, true, row.refCategory2, row.refId2, combatTables)
      : null;
    const buffEffect = VERIFIED_BUFF_EFFECT_IDS.has(row.ID)
      ? mapBuffEffect(row.ID, row.Name, combatTables)
      : null;
    return [{
      id: slugify(name),
      sourceMagicId: row.ID,
      name,
      type,
      fpCost: row.mp,
      chargedFpCost: chargedAttack ? row.mp_charge : null,
      sustainedFpCost: SUSTAINED_SPELL_IDS.has(row.ID) ? row.mp_charge : null,
      slotsRequired: row.slotLength,
      requirements: {
        intelligence: row.requirementIntellect,
        faith: row.requirementFaith,
        arcane: row.requirementLuck,
      },
      iconId: row.iconId,
      calculationStatus: attack || buffEffect ? "supported" as const : "catalog-only" as const,
      buffEffect,
      attack,
      chargedAttack,
    }];
  });
  if (new Set(spells.map(({ id }) => id)).size !== spells.length) throw new Error("Spell catalog contains duplicate IDs");
  return spells;
}

function mapBuffEffect(magicId: number, name: string, tables?: SpellCombatTables) {
  if (!tables) return null;
  const effectId = VERIFIED_BUFF_EFFECT_IDS.get(magicId)!;
  const effect = tables.effects.find(({ ID }) => ID === effectId);
  if (!effect) throw new Error(`Missing buff effect ${effectId} for ${name}`);
  const neutral = { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
  const zero = { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
  const emptyStatus = { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 };
  if (magicId === 6600 || BODY_BUFF_IDS.has(magicId)) {
    return {
      slot: magicId === 6600 ? "aura" as const : "body" as const,
      durationSeconds: effect.effectEndurance,
      outgoingDamageMultipliers: {
        physical: effect.atkEnemyDmgCorrectRate_Physics,
        magic: effect.atkEnemyDmgCorrectRate_Magic,
        fire: effect.atkEnemyDmgCorrectRate_Fire,
        lightning: effect.atkEnemyDmgCorrectRate_Thunder,
        holy: effect.atkEnemyDmgCorrectRate_Dark,
      },
      weaponAddedDamageScaling: zero,
      weaponAddedStatusBuildup: emptyStatus,
      limitations: magicId === 7330
        ? ["The increased incoming damage from Howl of Shabriri is not yet included."]
        : [],
    };
  }
  const statusEffect = STATUS_WEAPON_BUFF_IDS.has(magicId)
    ? tables.effects.find(({ ID }) => ID === effect.atkOccurrenceSpEffectId)
    : null;
  if (STATUS_WEAPON_BUFF_IDS.has(magicId) && !statusEffect) {
    throw new Error(`Missing weapon status effect ${effect.atkOccurrenceSpEffectId} for ${name}`);
  }
  return {
    slot: "weapon" as const,
    durationSeconds: effect.effectEndurance,
    outgoingDamageMultipliers: neutral,
    weaponAddedDamageScaling: {
      physical: effect.physicsAttackPower / 100,
      magic: effect.magicAttackPower / 100,
      fire: effect.fireAttackPower / 100,
      lightning: effect.thunderAttackPower / 100,
      holy: effect.darkAttackPower / 100,
    },
    weaponAddedStatusBuildup: statusEffect ? {
      poison: statusEffect.poizonAttackPower,
      rot: statusEffect.diseaseAttackPower,
      bleed: statusEffect.bloodAttackPower,
      frost: statusEffect.freezeAttackPower,
      sleep: statusEffect.sleepAttackPower,
      madness: statusEffect.madnessAttackPower,
      deathBlight: statusEffect.curseAttackPower,
    } : emptyStatus,
    limitations: magicId === 6320
      ? ["Delayed blood-loss buildup is not yet included."]
      : magicId === 6250
        ? ["Black Flame percentage-based damage over time is not yet included."]
        : magicId === 6770
          ? ["Order's Blade anti-undead behavior is not yet included."]
          : magicId === 6970
            ? ["Vyke's Dragonbolt equip-load bonus and increased lightning damage taken are not yet included."]
            : [],
  };
}

function mapSpellAttack(
  magicId: number,
  name: string,
  charged: boolean,
  refCategory: number,
  refId: number,
  tables?: SpellCombatTables,
) {
  if (MULTI_COMPONENT_SPELL_IDS.has(magicId)) {
    return mapMultiComponentAttack(magicId, name, charged, refCategory, refId, tables);
  }
  return mapDirectProjectileAttack(magicId, name, refCategory, refId, tables);
}

function mapDirectProjectileAttack(
  magicId: number,
  name: string,
  refCategory: number,
  refId: number,
  tables?: SpellCombatTables,
) {
  if (!tables) return null;
  if (refCategory !== 1 || refId < 0) {
    throw new Error(`Verified direct spell ${name} has no projectile bullet`);
  }
  const rootBullet = tables.bullets.find(({ ID }) => ID === refId);
  if (!rootBullet) throw new Error(`Missing projectile bullet ${refId}`);
  const bullet = HIT_BULLET_DAMAGE_IDS.has(magicId)
    ? tables.bullets.find(({ ID }) => ID === rootBullet.HitBulletID)
    : rootBullet;
  if (!bullet || bullet.atkId_Bullet < 0) throw new Error(`Missing damage bullet for ${name}`);
  const attack = tables.attacks.find(({ ID }) => ID === bullet.atkId_Bullet);
  if (!attack) throw new Error(`Missing spell attack ${bullet.atkId_Bullet}`);
  const finalRates = attack.finalDamageRateId < 0
    ? { physRate: 1, magRate: 1, fireRate: 1, thunRate: 1, darkRate: 1 }
    : tables.finalDamageRates.find(({ ID }) => ID === attack.finalDamageRateId);
  if (!finalRates) throw new Error(`Missing final damage rate ${attack.finalDamageRateId}`);
  return {
    id: `${slugify(name.replace(/^\[(?:Sorcery|Incantation)\]\s*/, ""))}-hit`,
    label: "Hit",
    sourceBulletId: bullet.ID,
    sourceAttackId: attack.ID,
    outputUnit: SUSTAINED_SPELL_IDS.has(magicId)
      ? "per-tick" as const
      : "per-hit" as const,
    motionValues: {
      physical: attack.atkPhys, magic: attack.atkMag, fire: attack.atkFire,
      lightning: attack.atkThun, holy: attack.atkDark,
    },
    finalDamageRates: {
      physical: finalRates.physRate, magic: finalRates.magRate, fire: finalRates.fireRate,
      lightning: finalRates.thunRate, holy: finalRates.darkRate,
    },
    statusBuildup: mapStatusBuildup(bullet, tables.effects),
    additionalComponents: [],
  };
}

function mapMultiComponentAttack(
  magicId: number,
  name: string,
  charged: boolean,
  refCategory: number,
  refId: number,
  tables?: SpellCombatTables,
) {
  if (!tables) return null;
  if (refCategory !== 1 || refId < 0) throw new Error(`Verified multi-component spell ${name} has no root bullet`);
  const configurations = multiComponentConfigurations(magicId, charged);
  if (configurations[0]?.rootBulletId !== refId) throw new Error(`Unexpected root bullet ${refId} for ${name}`);
  const components = configurations.map(({ bulletId, id, label, outputUnit }) => {
    const bullet = tables.bullets.find(({ ID }) => ID === bulletId);
    if (!bullet) throw new Error(`Missing component bullet ${bulletId} for ${name}`);
    const attack = tables.attacks.find(({ ID }) => ID === bullet.atkId_Bullet);
    if (!attack) throw new Error(`Missing component attack ${bullet.atkId_Bullet} for ${name}`);
    const finalRates = attack.finalDamageRateId < 0
      ? { physRate: 1, magRate: 1, fireRate: 1, thunRate: 1, darkRate: 1 }
      : tables.finalDamageRates.find(({ ID }) => ID === attack.finalDamageRateId);
    if (!finalRates) throw new Error(`Missing final damage rate ${attack.finalDamageRateId}`);
    return {
      id, label, outputUnit, sourceBulletId: bullet.ID, sourceAttackId: attack.ID,
      motionValues: {
        physical: attack.atkPhys, magic: attack.atkMag, fire: attack.atkFire,
        lightning: attack.atkThun, holy: attack.atkDark,
      },
      finalDamageRates: {
        physical: finalRates.physRate, magic: finalRates.magRate, fire: finalRates.fireRate,
        lightning: finalRates.thunRate, holy: finalRates.darkRate,
      },
      statusBuildup: mapStatusBuildup(bullet, tables.effects),
    };
  });
  const [primary, ...additionalComponents] = components;
  if (!primary) throw new Error(`Missing component configuration for ${name}`);
  return { ...primary, additionalComponents };
}

function multiComponentConfigurations(magicId: number, charged: boolean) {
  const suffix = charged ? "charged" : "normal";
  const bySpell = {
    4800: charged ? [
      component(10480050, 10480051, `impact-${suffix}`, "Impact", "per-hit"),
      component(10480050, 10480054, `magma-${suffix}`, "Magma pool", "per-tick"),
    ] : [
      component(10480000, 10480001, `impact-${suffix}`, "Impact", "per-hit"),
      component(10480000, 10480004, `magma-${suffix}`, "Magma pool", "per-tick"),
    ],
    4820: charged ? [
      component(10482050, 10482050, `projectile-${suffix}`, "Projectile", "per-hit"),
      component(10482050, 10482054, `explosion-${suffix}`, "Explosion", "per-hit"),
      component(10482050, 10482057, `magma-${suffix}`, "Magma pool", "per-tick"),
    ] : [
      component(10482000, 10482000, `projectile-${suffix}`, "Projectile", "per-hit"),
      component(10482000, 10482004, `explosion-${suffix}`, "Explosion", "per-hit"),
      component(10482000, 10482007, `magma-${suffix}`, "Magma pool", "per-tick"),
    ],
    5010: [
      component(10501000, 10501000, "initial-blast", "Initial blast", "per-hit"),
      component(10501000, 10501020, "ghostflame", "Ghostflame", "per-tick"),
    ],
    4500: charged ? [
      component(10450001, 10450001, "initial-crystals-charged", "Initial crystals", "per-hit"),
      component(10450001, 10450003, "burst-charged", "Crystal burst", "per-hit"),
      component(10450001, 10450004, "fragments-charged", "Crystal fragments", "per-hit"),
    ] : [
      component(10450000, 10450000, "initial-crystals-normal", "Initial crystals", "per-hit"),
      component(10450000, 10450003, "burst-normal", "Crystal burst", "per-hit"),
      component(10450000, 10450004, "fragments-normal", "Crystal fragments", "per-hit"),
    ],
    6940: [
      component(10694000, 10694000, "spear-impact", "Spear impact", "per-hit"),
      component(10694000, 10694001, "secondary-strike", "Secondary strike", "per-hit"),
      component(10694000, 10694002, "lightning-wave", "Lightning wave", "per-hit"),
    ],
    6941: [
      component(10694100, 10694100, "first-spear-impact", "First spear impact", "per-hit"),
      component(10694100, 10694101, "first-secondary-strike", "First secondary strike", "per-hit"),
      component(10694100, 10694102, "first-lightning-wave", "First lightning wave", "per-hit"),
      component(10694100, 10694150, "second-spear-impact", "Second spear impact", "per-hit"),
      component(10694100, 10694151, "second-secondary-strike", "Second secondary strike", "per-hit"),
      component(10694100, 10694152, "second-lightning-wave", "Second lightning wave", "per-hit"),
    ],
  } as const;
  return bySpell[magicId as keyof typeof bySpell] ?? [];
}

function component(
  rootBulletId: number,
  bulletId: number,
  id: string,
  label: string,
  outputUnit: "per-hit" | "per-tick",
) {
  return { rootBulletId, bulletId, id, label, outputUnit };
}

function mapStatusBuildup(bullet: BulletParamRow, effects: ArmorEffectRow[]) {
  const status = {
    poison: 0, rot: 0, bleed: 0, frost: 0,
    sleep: 0, madness: 0, deathBlight: 0,
  };
  for (const effectId of [
    bullet.spEffectId0 ?? 0, bullet.spEffectId1 ?? 0, bullet.spEffectId2 ?? 0,
    bullet.spEffectId3 ?? 0, bullet.spEffectId4 ?? 0,
  ]) {
    if (effectId <= 0) continue;
    const effect = effects.find(({ ID }) => ID === effectId);
    if (!effect) throw new Error(`Missing spell status effect ${effectId}`);
    status.poison += effect.poizonAttackPower;
    status.rot += effect.diseaseAttackPower;
    status.bleed += effect.bloodAttackPower;
    status.frost += effect.freezeAttackPower;
    status.sleep += effect.sleepAttackPower;
    status.madness += effect.madnessAttackPower;
    status.deathBlight += effect.curseAttackPower;
  }
  return status;
}

function parsePlayerSpellName(value: string): { name: string; type: SpellType } | null {
  const match = value.match(/^\[(Sorcery|Incantation)\]\s+(.+)$/);
  if (!match) return null;
  return { type: match[1]!.toLowerCase() as SpellType, name: match[2]!.trim() };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
