import type { AshOfWarData } from "../../../features/ashesOfWar/domain/ashOfWar.types";
import { ASH_OF_WAR_COMPATIBILITY_FIELDS } from "../data/ashOfWarCompatibility";
import { flameOfTheRedmanesSkillDefinition } from "../data/flameOfTheRedmanesSkillDefinition";
import { squareOffSkillDefinition } from "../data/squareOffSkillDefinition";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { EquipParamGemRow } from "../schemas/weaponSkillParam.schema";
import {
  mapRegulationWeaponSkill,
  type RegulationWeaponSkillDefinition,
} from "./mapRegulationWeaponSkill";

const LONGSWORD_SOURCE_ID = 1000000;

const verifiedAshes = [
  { sourceGemId: 11500, definition: squareOffSkillDefinition },
  { sourceGemId: 50500, definition: flameOfTheRedmanesSkillDefinition },
] as const;

type SkillTables = Parameters<typeof mapRegulationWeaponSkill>[2];

export function mapVerifiedAshesOfWar(
  gems: EquipParamGemRow[],
  weapons: WeaponParamRow[],
  tables: SkillTables,
): AshOfWarData[] {
  const referenceWeapon = findOne(weapons, LONGSWORD_SOURCE_ID, "weapon");

  return verifiedAshes.map(({ sourceGemId, definition }) => {
    const gem = findOne(gems, sourceGemId, "EquipParamGem");

    if (gem.swordArtsParamId !== definition.swordArtId) {
      throw new Error(`Ash of War ${gem.ID} has unexpected SwordArtsParam ${gem.swordArtsParamId}`);
    }

    return {
      id: definition.id,
      sourceGemId: gem.ID,
      name: gem.Name.replace(/^Ash of War:\s*/, ""),
      iconId: gem.iconId,
      compatibleWeaponTypes: compatibleWeaponTypes(gem),
      skill: mapRegulationWeaponSkill(
        referenceWeapon,
        definition as RegulationWeaponSkillDefinition,
        tables,
      ),
    };
  });
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
