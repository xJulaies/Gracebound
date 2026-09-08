export const BRANDING_ASSET_IDS = [
  "gracebound-hero",
  "gracebound-hero-mobile",
  "gracebound-hero-desktop",
  "gracebound-navbar-logo",
  "gracebound-navbar-logo-compact",
  "gracebound-background-grace",
  "gracebound-background-grace-mobile",
  "gracebound-background-night",
  "gracebound-background-night-mobile",
] as const;

export type BrandingAssetId = (typeof BRANDING_ASSET_IDS)[number];

export interface BrandingImageAssetData {
  assetId: BrandingAssetId;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
  sourceHash: string;
}
