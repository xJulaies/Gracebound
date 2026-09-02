import { ArmorModel } from "../../features/armor/models/armor.model";
import { AshOfWarModel } from "../../features/ashesOfWar/models/ashOfWar.model";
import { SpellModel } from "../../features/spells/models/spell.model";
import { TalismanModel } from "../../features/talismans/models/talisman.model";
import { WeaponCatalogModel } from "../../features/weapons/models/weaponCatalog.model";

export async function loadCatalogIconIds(gameVersion: string) {
  const filter = { gameVersion };
  const groups = await Promise.all([
    WeaponCatalogModel.distinct("iconId", filter),
    ArmorModel.distinct("iconId", filter),
    TalismanModel.distinct("iconId", filter),
    SpellModel.distinct("iconId", filter),
    AshOfWarModel.distinct("iconId", filter),
  ]);

  return [...new Set(groups.flat())].sort((left, right) => left - right);
}
