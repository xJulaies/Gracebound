import type { CharacterStats } from "../../builds/domain/buildStats.types";

export interface CharacterClassData {
  id: string;
  name: string;
  level: number;
  stats: CharacterStats;
}
