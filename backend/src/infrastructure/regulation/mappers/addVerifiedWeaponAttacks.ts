import type { WeaponCatalogDataSet } from "../../../features/weapons/domain/weaponCatalog.types";
import {
  createMeleeAttackDefinitions,
  meleeWeaponClassDefinitions,
} from "../data/meleeWeaponClassDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";
import { mapRegulationWeaponAttacks } from "./mapRegulationWeaponAttacks";

export function addVerifiedWeaponAttacks(
  dataSet: WeaponCatalogDataSet,
  weaponRows: WeaponParamRow[],
  behaviorRows: BehaviorParamRow[],
  attackRows: AttackParamRow[],
): WeaponCatalogDataSet {
  const classesByMotionCategory = new Map(
    meleeWeaponClassDefinitions.map((definition) => [definition.motionCategoryId, definition]),
  );
  const meleeWeaponsBySourceId = new Map(
    weaponRows
      .filter(
        (weapon) =>
          weapon.ID === weapon.originEquipWep &&
          classesByMotionCategory.has(weapon.wepmotionCategory),
      )
      .map((weapon) => [weapon.ID, weapon]),
  );

  return {
    ...dataSet,
    catalog: Object.fromEntries(
      Object.entries(dataSet.catalog).map(([id, entry]) => {
        const weapon = meleeWeaponsBySourceId.get(entry.sourceId);

        if (!weapon) return [id, entry];

        const weaponClass = classesByMotionCategory.get(weapon.wepmotionCategory)!;

        return [id, {
          ...entry,
          attacks: mapRegulationWeaponAttacks(
            weapon,
            createMeleeAttackDefinitions(weaponClass),
            behaviorRows,
            attackRows,
          ),
        }];
      }),
    ),
  };
}
