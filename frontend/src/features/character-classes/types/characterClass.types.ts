import type { CharacterStats } from "../../../shared/types/game.types";

export interface CharacterClass {
  id: string;
  name: string;
  imageUrl: string;
  level: number;
  stats: CharacterStats;
  gameVersion: string;
}
