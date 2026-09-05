import { useInfiniteArmorQuery } from "../../armor/hooks/useArmorQuery";
import { useInfiniteTalismansQuery } from "../../talismans/hooks/useTalismansQuery";
import { useInfiniteWeaponsQuery } from "../../weapons/hooks/useWeaponsQuery";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import type {
  EquipmentCatalogGroup,
  EquipmentCatalogItem,
  EquipmentCatalogSearch,
  EquipmentItemCategory,
} from "../types/equipmentCatalog.types";

const CATALOG_PAGE_SIZE = 24;

export function useEquipmentCatalogQueries(
  filters: EquipmentCatalogSearch,
): EquipmentCatalogGroup[] {
  const search = useDebouncedValue(filters.search.trim(), 250);
  const shows = (category: EquipmentItemCategory) =>
    filters.category === "all" || filters.category === category;
  const armamentsEnabled = shows("armaments");
  const armorEnabled = shows("armor");
  const talismansEnabled = shows("talismans");
  const armaments = useInfiniteWeaponsQuery(
    {
      limit: CATALOG_PAGE_SIZE,
      ...(search && { search }),
      ...(filters.affinity && { affinity: filters.affinity }),
      ...(filters.weaponType && { weaponType: filters.weaponType }),
    },
    armamentsEnabled,
  );
  const armor = useInfiniteArmorQuery(
    {
      limit: CATALOG_PAGE_SIZE,
      ...(search && { search }),
      ...(filters.armorSlot && { slot: filters.armorSlot }),
    },
    armorEnabled,
  );
  const talismans = useInfiniteTalismansQuery(
    {
      limit: CATALOG_PAGE_SIZE,
      ...(search && { search }),
      ...(filters.talismanStatus && {
        calculationStatus: filters.talismanStatus,
      }),
    },
    talismansEnabled,
  );

  return [
    ...(armamentsEnabled ? [{
      category: "armaments" as const,
      label: "Armaments",
      hasNextPage: armaments.hasNextPage,
      isPending: armaments.isPending,
      isError: armaments.isError,
      isFetchingNextPage: armaments.isFetchingNextPage,
      loadMore: () => { void armaments.fetchNextPage(); },
      items: armaments.data?.pages.flatMap(({ data }) => data).map((item): EquipmentCatalogItem => ({
        category: "armaments",
        description: item.description,
        iconUrl: item.iconUrl,
        id: item.id,
        metadata: [formatLabel(item.weaponType ?? "Unknown type")],
        name: item.name,
        summary: item.summary,
        source: item,
        weight: item.weight,
      })) ?? [],
    }] : []),
    ...(armorEnabled ? [{
      category: "armor" as const,
      label: "Armor",
      hasNextPage: armor.hasNextPage,
      isPending: armor.isPending,
      isError: armor.isError,
      isFetchingNextPage: armor.isFetchingNextPage,
      loadMore: () => { void armor.fetchNextPage(); },
      items: armor.data?.pages.flatMap(({ data }) => data).map((item): EquipmentCatalogItem => ({
        category: "armor",
        description: item.description,
        iconUrl: item.iconUrl,
        id: item.id,
        metadata: [`${formatLabel(item.slot)} armor`, `Poise ${item.poise}`],
        name: item.name,
        summary: item.summary,
        source: item,
        weight: item.weight,
      })) ?? [],
    }] : []),
    ...(talismansEnabled ? [{
      category: "talismans" as const,
      label: "Talismans",
      hasNextPage: talismans.hasNextPage,
      isPending: talismans.isPending,
      isError: talismans.isError,
      isFetchingNextPage: talismans.isFetchingNextPage,
      loadMore: () => { void talismans.fetchNextPage(); },
      items: talismans.data?.pages.flatMap(({ data }) => data)
        .map((item): EquipmentCatalogItem => ({
          category: "talismans",
          description: item.description,
          iconUrl: item.iconUrl,
          id: item.id,
          metadata: [item.calculationStatus === "supported"
            ? "Build calculation supported"
            : "Catalog only"],
          name: item.name,
          summary: item.summary,
          source: item,
          weight: item.weight,
        })) ?? [],
    }] : []),
  ];
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
