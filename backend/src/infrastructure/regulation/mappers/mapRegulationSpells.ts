import type { SpellData, SpellType } from "../../../features/spells/domain/spell.types";
import type { MagicParamRow } from "../schemas/magic.schema";
import type { AttackParamRow } from "../schemas/weaponAttackParam.schema";
import type { BulletParamRow, FinalDamageRateRow } from "../schemas/weaponSkillParam.schema";

const FIRST_DLC_MAGIC_ID = 2_000_000;
const EXCLUDED_MAGIC_IDS = new Set([4641, 4642, 8000, 8001]);
const TYPE_OVERRIDES = new Map<number, SpellType>([
  [5040, "incantation"],
  [6500, "sorcery"],
]);
const VERIFIED_DIRECT_PROJECTILE_IDS = new Set([4000, 4001, 4010]);

export interface SpellCombatTables {
  bullets: BulletParamRow[];
  attacks: AttackParamRow[];
  finalDamageRates: FinalDamageRateRow[];
}

export function mapBaseGameSpells(rows: MagicParamRow[], combatTables?: SpellCombatTables): SpellData[] {
  const spells = rows.flatMap((row) => {
    if (row.ID >= FIRST_DLC_MAGIC_ID || EXCLUDED_MAGIC_IDS.has(row.ID)) return [];
    const parsedName = parsePlayerSpellName(row.Name);
    if (!parsedName) return [];
    if (row.slotLength < 1) throw new Error(`Playable spell ${row.Name} has no memory-slot cost`);
    const type = TYPE_OVERRIDES.get(row.ID) ?? parsedName.type;
    const attack = VERIFIED_DIRECT_PROJECTILE_IDS.has(row.ID)
      ? mapDirectProjectileAttack(row, combatTables)
      : null;
    return [{
      id: slugify(parsedName.name),
      sourceMagicId: row.ID,
      name: parsedName.name,
      type,
      fpCost: row.mp,
      slotsRequired: row.slotLength,
      requirements: {
        intelligence: row.requirementIntellect,
        faith: row.requirementFaith,
        arcane: row.requirementLuck,
      },
      iconId: row.iconId,
      calculationStatus: attack ? "supported" as const : "catalog-only" as const,
      attack,
    }];
  });
  if (new Set(spells.map(({ id }) => id)).size !== spells.length) throw new Error("Spell catalog contains duplicate IDs");
  return spells;
}

function mapDirectProjectileAttack(row: MagicParamRow, tables?: SpellCombatTables) {
  if (!tables) return null;
  if (row.refCategory1 !== 1 || row.refId1 < 0) {
    throw new Error(`Verified direct spell ${row.Name} has no primary bullet`);
  }
  const bullet = tables.bullets.find(({ ID }) => ID === row.refId1);
  if (!bullet || bullet.atkId_Bullet < 0) throw new Error(`Missing primary bullet ${row.refId1}`);
  const attack = tables.attacks.find(({ ID }) => ID === bullet.atkId_Bullet);
  if (!attack) throw new Error(`Missing spell attack ${bullet.atkId_Bullet}`);
  const finalRates = attack.finalDamageRateId < 0
    ? { physRate: 1, magRate: 1, fireRate: 1, thunRate: 1, darkRate: 1 }
    : tables.finalDamageRates.find(({ ID }) => ID === attack.finalDamageRateId);
  if (!finalRates) throw new Error(`Missing final damage rate ${attack.finalDamageRateId}`);
  return {
    sourceBulletId: bullet.ID,
    sourceAttackId: attack.ID,
    motionValues: {
      physical: attack.atkPhys, magic: attack.atkMag, fire: attack.atkFire,
      lightning: attack.atkThun, holy: attack.atkDark,
    },
    finalDamageRates: {
      physical: finalRates.physRate, magic: finalRates.magRate, fire: finalRates.fireRate,
      lightning: finalRates.thunRate, holy: finalRates.darkRate,
    },
  };
}

function parsePlayerSpellName(value: string): { name: string; type: SpellType } | null {
  const match = value.match(/^\[(Sorcery|Incantation)\]\s+(.+)$/);
  if (!match) return null;
  return { type: match[1]!.toLowerCase() as SpellType, name: match[2]!.trim() };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
