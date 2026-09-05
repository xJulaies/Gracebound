export const UI_ASSET_IDS = [
  "slot-base",
  "slot-frame",
  "left-weapon-slot",
  "right-weapon-slot",
  "talisman-slot",
  "equipment-frame",
  "ash-of-war-frame",
  "equipment-category",
  "magic-category",
  "crystal-tear-category",
  "weapon-category",
  "armor-category",
  "sorcery-category",
  "incantation-category",
  "ash-of-war-category",
] as const;

export type UiAssetId = (typeof UI_ASSET_IDS)[number];

export interface UiAssetData {
  assetId: UiAssetId;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
}
