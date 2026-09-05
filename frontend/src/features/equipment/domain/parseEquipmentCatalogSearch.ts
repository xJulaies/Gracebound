import {
  EQUIPMENT_CATEGORIES,
  type EquipmentCatalogSearch,
  type EquipmentCategory,
} from "../types/equipmentCatalog.types";
import type { ArmorSlot } from "../../armor/types/armor.types";
import type { Talisman } from "../../talismans/types/talisman.types";

const armorSlots: ArmorSlot[] = ["head", "body", "arms", "legs"];
const talismanStatuses: Talisman["calculationStatus"][] = ["supported", "catalog-only"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseEquipmentCatalogSearch(
  search: Record<string, unknown>,
): EquipmentCatalogSearch {
  return {
    category: isEquipmentCategory(search.category) ? search.category : "all",
    search: typeof search.search === "string" ? search.search.slice(0, 100) : "",
    ...(isSlug(search.affinity) && { affinity: search.affinity }),
    ...(isSlug(search.weaponType) && { weaponType: search.weaponType }),
    ...(isArmorSlot(search.armorSlot) && { armorSlot: search.armorSlot }),
    ...(isTalismanStatus(search.talismanStatus) && {
      talismanStatus: search.talismanStatus,
    }),
  };
}

function isSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80 && slugPattern.test(value);
}

function isArmorSlot(value: unknown): value is ArmorSlot {
  return typeof value === "string" && armorSlots.some((slot) => slot === value);
}

function isTalismanStatus(value: unknown): value is Talisman["calculationStatus"] {
  return typeof value === "string"
    && talismanStatuses.some((status) => status === value);
}

function isEquipmentCategory(value: unknown): value is EquipmentCategory {
  return typeof value === "string"
    && EQUIPMENT_CATEGORIES.some((category) => category === value);
}
