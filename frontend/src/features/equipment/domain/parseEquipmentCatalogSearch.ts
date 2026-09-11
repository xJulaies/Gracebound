import {
  EQUIPMENT_CATEGORIES,
  type EquipmentCatalogSearch,
} from "../types/equipmentCatalog.types";
import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const boundedSearchSchema = z.preprocess(
  (value) => typeof value === "string" ? value.slice(0, 100) : "",
  z.string(),
);
const optionalSlugSchema = z.string().max(80).regex(slugPattern).optional().catch(undefined);
const equipmentCatalogSearchSchema = z.object({
  category: z.enum(EQUIPMENT_CATEGORIES).catch("all"),
  search: boundedSearchSchema,
  affinity: optionalSlugSchema,
  weaponType: optionalSlugSchema,
  armorSlot: z.enum(["head", "body", "arms", "legs"]).optional().catch(undefined),
  talismanStatus: z.enum(["supported", "catalog-only"]).optional().catch(undefined),
});

export function parseEquipmentCatalogSearch(
  search: Record<string, unknown>,
): EquipmentCatalogSearch {
  return equipmentCatalogSearchSchema.parse(search);
}
