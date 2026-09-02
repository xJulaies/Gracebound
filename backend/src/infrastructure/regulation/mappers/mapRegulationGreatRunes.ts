import type { GreatRuneData, GreatRuneEffects } from "../../../features/greatRunes/domain/greatRune.types";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import type { GreatRuneGoodsRow } from "../schemas/greatRune.schema";

interface GreatRuneDefinition {
  goodsId: number;
  id: string;
  effectId: number | null;
  supported: boolean;
  limitation?: string;
}

const DEFINITIONS: readonly GreatRuneDefinition[] = [
  { goodsId: 191, id: "godricks-great-rune", effectId: 600, supported: true },
  { goodsId: 192, id: "radahns-great-rune", effectId: 610, supported: true },
  { goodsId: 193, id: "morgotts-great-rune", effectId: 620, supported: true },
  { goodsId: 194, id: "rykards-great-rune", effectId: 630, supported: false, limitation: "Healing after defeating an enemy requires authoritative combat state." },
  { goodsId: 195, id: "mohgs-great-rune", effectId: 640, supported: false, limitation: "Phantom blessing and multiplayer effects are not calculated." },
  { goodsId: 196, id: "malenias-great-rune", effectId: 650, supported: false, limitation: "Rally healing requires authoritative damage and hit state." },
  { goodsId: 10080, id: "great-rune-of-the-unborn", effectId: null, supported: false, limitation: "This Great Rune enables rebirth and has no Rune Arc combat effect." },
];

export function mapRegulationGreatRunes(
  goods: GreatRuneGoodsRow[],
  effects: ArmorEffectRow[],
): GreatRuneData[] {
  return DEFINITIONS.map((definition) => {
    const item = findOne(goods, definition.goodsId, "EquipParamGoods");
    const effect = definition.effectId === null
      ? null
      : findOne(effects, definition.effectId, "SpEffectParam");

    return {
      id: definition.id,
      sourceGoodsId: item.ID,
      sourceEffectId: definition.effectId,
      name: item.Name,
      iconId: item.iconId,
      activation: definition.effectId === null ? "not-applicable" : "rune-arc",
      calculationStatus: definition.supported ? "supported" : "catalog-only",
      effects: definition.supported ? mapEffects(effect!) : null,
      limitations: definition.limitation ? [definition.limitation] : [],
    };
  });
}

function mapEffects(effect: ArmorEffectRow): GreatRuneEffects {
  return {
    attributeBonuses: {
      vigor: effect.addLifeForceStatus,
      mind: effect.addWillpowerStatus,
      endurance: effect.addEndureStatus,
      strength: effect.addStrengthStatus,
      dexterity: effect.addDexterityStatus,
      intelligence: effect.addMagicStatus,
      faith: effect.addFaithStatus,
      arcane: effect.addLuckStatus,
    },
    resourceMultipliers: {
      maxHp: effect.maxHpRate,
      maxFp: effect.maxMpRate,
      maxStamina: effect.maxStaminaRate,
    },
  };
}

function findOne<T extends { ID: number }>(rows: T[], id: number, table: string): T {
  const matches = rows.filter((row) => row.ID === id);
  if (matches.length !== 1) throw new Error(`Expected one ${table} ${id}, found ${matches.length}`);
  return matches[0]!;
}
