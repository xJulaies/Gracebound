export interface AshOfWar {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  iconId: number;
  iconUrl: string;
  compatibleWeaponTypes: string[];
  compatibleAffinities: string[];
  calculationStatus: "supported" | "catalog-only";
  attacks: Array<{ id: string; name: string; fpCost: number }>;
  gameVersion: string;
}
