export const EQUIPMENT_CATEGORIES = [
  "all",
  "armaments",
  "armor",
  "talismans",
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export interface EquipmentCatalogSearch {
  category: EquipmentCategory;
  search: string;
  affinity?: string;
  weaponType?: string;
  armorSlot?: ArmorSlot;
  talismanStatus?: Talisman["calculationStatus"];
}

export type EquipmentFilterKey = Exclude<keyof EquipmentCatalogSearch, "category" | "search">;

export type EquipmentItemCategory = Exclude<EquipmentCategory, "all">;

interface EquipmentCatalogItemBase {
  category: EquipmentItemCategory;
  description: string | null;
  iconUrl: string;
  id: string;
  metadata: string[];
  name: string;
  summary: string | null;
  weight: number;
}

export type EquipmentCatalogItem =
  | EquipmentCatalogItemBase & { category: "armaments"; source: Weapon }
  | EquipmentCatalogItemBase & { category: "armor"; source: Armor }
  | EquipmentCatalogItemBase & { category: "talismans"; source: Talisman };

export interface EquipmentCatalogGroup {
  category: EquipmentItemCategory;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  items: EquipmentCatalogItem[];
  label: string;
  loadMore: () => void;
}
import type { Armor, ArmorSlot } from "../../armor/types/armor.types";
import type { Talisman } from "../../talismans/types/talisman.types";
import type { Weapon } from "../../weapons/types/weapon.types";
