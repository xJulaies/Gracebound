export interface Talisman {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  iconId: number;
  iconUrl: string;
  weight: number;
  calculationStatus: "catalog-only" | "supported";
  effects: Record<string, unknown> | null;
  gameVersion: string;
}
