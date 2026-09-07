export interface OffensePreviewAction {
  id: string;
  label: string;
  attackRating: number;
  offensiveOutput: number;
}

export interface WeaponOffensePreview {
  actions: OffensePreviewAction[];
}

export type SpellOffensePreview = WeaponOffensePreview;
