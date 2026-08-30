import type { AshOfWarData } from "../../../features/ashesOfWar/domain/ashOfWar.types";
import { WEAPON_AFFINITIES } from "../../../features/weapons/domain/weaponCatalog.types";
import { ASH_OF_WAR_COMPATIBILITY_FIELDS } from "../data/ashOfWarCompatibility";
import { flameOfTheRedmanesSkillDefinition } from "../data/flameOfTheRedmanesSkillDefinition";
import { squareOffSkillDefinition } from "../data/squareOffSkillDefinition";
import { standardAshOfWarSkillDefinitions } from "../data/standardAshOfWarSkillDefinitions";
import { wildStrikesSkillDefinitions } from "../data/wildStrikesSkillDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { EquipParamGemRow } from "../schemas/weaponSkillParam.schema";
import {
  mapRegulationWeaponSkill,
  type RegulationWeaponSkillDefinition,
} from "./mapRegulationWeaponSkill";

const LONGSWORD_SOURCE_ID = 1000000;

const verifiedAshes = new Map<number, RegulationWeaponSkillDefinition>([
  { sourceGemId: 11500, definition: squareOffSkillDefinition },
  { sourceGemId: 50500, definition: flameOfTheRedmanesSkillDefinition },
  ...standardAshOfWarSkillDefinitions,
].map(({ sourceGemId, definition }) => [sourceGemId, definition]));

type SkillTables = Parameters<typeof mapRegulationWeaponSkill>[2];

export function mapVerifiedAshesOfWar(
  gems: EquipParamGemRow[],
  weapons: WeaponParamRow[],
  tables: SkillTables,
): AshOfWarData[] {
  const referenceWeapon = findOne(weapons, LONGSWORD_SOURCE_ID, "weapon");

  return gems
    .filter(({ ID, Name }) => ID >= 10000 && /^Ash of War:\s*.+/.test(Name))
    .map((gem) => {
    const definition = verifiedAshes.get(gem.ID);
    const skillVariants = gem.ID === 11000
      ? wildStrikesSkillDefinitions.map(({ weaponType, motionCategoryId, definition: variantDefinition }) => ({
        weaponTypes: [weaponType],
        skill: mapRegulationWeaponSkill(
          findReferenceWeapon(weapons, motionCategoryId),
          variantDefinition,
          tables,
        ),
      }))
      : [];

    if (definition && gem.swordArtsParamId !== definition.swordArtId) {
      throw new Error(`Ash of War ${gem.ID} has unexpected SwordArtsParam ${gem.swordArtsParamId}`);
    }

    if (skillVariants.length > 0 && gem.swordArtsParamId !== 110) {
      throw new Error(`Wild Strikes ${gem.ID} has unexpected SwordArtsParam ${gem.swordArtsParamId}`);
    }

    return {
      id: definition?.id ?? slugify(gem.Name.replace(/^Ash of War:\s*/, "")),
      sourceGemId: gem.ID,
      name: gem.Name.replace(/^Ash of War:\s*/, ""),
      iconId: gem.iconId,
      sourceSwordArtId: gem.swordArtsParamId,
      compatibleWeaponTypes: compatibleWeaponTypes(gem),
      compatibleAffinities: WEAPON_AFFINITIES.filter(
        (_affinity, index) => gem[`configurableWepAttr${index.toString().padStart(2, "0")}`] === 1,
      ),
      calculationStatus: definition || skillVariants.length > 0
        ? "supported" as const
        : "catalog-only" as const,
      skill: definition
        ? mapRegulationWeaponSkill(referenceWeapon, definition, tables)
        : null,
      skillVariants,
    };
  });
}

function findReferenceWeapon(rows: WeaponParamRow[], motionCategoryId: number): WeaponParamRow {
  const match = rows.find(({ ID, Name, originEquipWep, wepmotionCategory }) =>
    ID === originEquipWep && Name !== "" && wepmotionCategory === motionCategoryId,
  );
  if (!match) throw new Error(`Missing reference weapon for motion category ${motionCategoryId}`);
  return match;
}

function compatibleWeaponTypes(gem: EquipParamGemRow): string[] {
  return Object.entries(ASH_OF_WAR_COMPATIBILITY_FIELDS)
    .filter(([field]) => gem[field] === 1)
    .map(([, weaponType]) => weaponType);
}

function findOne<T extends { ID: number }>(rows: T[], id: number, name: string): T {
  const matches = rows.filter(({ ID }) => ID === id);
  if (matches.length !== 1) throw new Error(`Expected one ${name} ${id}, found ${matches.length}`);
  return matches[0]!;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
