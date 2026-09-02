import type { DamageTypes } from "../../../shared/types/game.types";

export interface Boss {
  id: string;
  name: string;
  health: number;
  defense: DamageTypes;
  absorption: {
    physical: { standard: number; slash: number; strike: number; pierce: number };
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  gameVersion: string;
}
