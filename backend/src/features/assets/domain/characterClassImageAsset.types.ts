export interface CharacterClassImageAssetData {
  classId: string;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
}
