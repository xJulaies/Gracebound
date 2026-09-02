import { IconAssetModel } from "../../features/assets/models/iconAsset.model";
import { loadCatalogIconIds } from "./loadCatalogIconIds";

export interface IconCoverageReport {
  catalogIconIds: number;
  storedIconIds: number;
  missingIconIds: number[];
  orphanedIconIds: number[];
}

export function compareIconCoverage(catalogIconIds: number[], storedIconIds: number[]): IconCoverageReport {
  const catalog = new Set(catalogIconIds);
  const stored = new Set(storedIconIds);

  return {
    catalogIconIds: catalog.size,
    storedIconIds: stored.size,
    missingIconIds: [...catalog].filter((iconId) => !stored.has(iconId)).sort((left, right) => left - right),
    orphanedIconIds: [...stored].filter((iconId) => !catalog.has(iconId)).sort((left, right) => left - right),
  };
}

export async function auditIconCoverage(gameVersion: string) {
  const [catalogIconIds, storedIconIds] = await Promise.all([
    loadCatalogIconIds(gameVersion),
    IconAssetModel.distinct("iconIds", { gameVersion }),
  ]);

  return compareIconCoverage(catalogIconIds, storedIconIds);
}
