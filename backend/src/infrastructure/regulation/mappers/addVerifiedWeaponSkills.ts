import type { WeaponCatalogDataSet } from "../../../features/weapons/domain/weaponCatalog.types";
import { moonveilSkillDefinition } from "../data/moonveilSkillDefinition";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";
import type {
  BulletParamRow,
  FinalDamageRateRow,
  SwordArtsParamRow,
} from "../schemas/weaponSkillParam.schema";
import { mapRegulationWeaponSkill } from "./mapRegulationWeaponSkill";

const MOONVEIL_SOURCE_ID = 9060000;

interface WeaponSkillTables {
  behaviors: BehaviorParamRow[];
  attacks: AttackParamRow[];
  bullets: BulletParamRow[];
  swordArts: SwordArtsParamRow[];
  finalDamageRates: FinalDamageRateRow[];
}

export function addVerifiedWeaponSkills(
  dataSet: WeaponCatalogDataSet,
  weaponRows: WeaponParamRow[],
  tables: WeaponSkillTables,
): WeaponCatalogDataSet {
  const moonveil = weaponRows.find(({ ID }) => ID === MOONVEIL_SOURCE_ID);
  const catalogEntry = dataSet.catalog.moonveil;

  if (!moonveil || !catalogEntry) {
    throw new Error("Missing Moonveil for verified skill mapping");
  }

  return {
    ...dataSet,
    catalog: {
      ...dataSet.catalog,
      moonveil: {
        ...catalogEntry,
        skills: [mapRegulationWeaponSkill(moonveil, moonveilSkillDefinition, tables)],
      },
    },
  };
}
