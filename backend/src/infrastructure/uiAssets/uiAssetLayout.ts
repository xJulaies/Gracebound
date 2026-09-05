export interface UiAssetLayoutEntry {
  name: string;
  atlasName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const atlasPattern = /<TextureAtlas\s+imagePath="([^"]+)"/;
const entryPattern = /<SubTexture\s+name="([^"]+)\.png"\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"\s+height="(\d+)"/g;

export function parseUiAssetLayout(source: string): UiAssetLayoutEntry[] {
  const atlasMatch = atlasPattern.exec(source);
  if (!atlasMatch) throw new Error("Layout does not declare a texture atlas");
  const atlasName = atlasMatch[1].replace(/\.png$/i, "");

  return [...source.matchAll(entryPattern)].map((match) => ({
    name: match[1],
    atlasName,
    x: Number(match[2]),
    y: Number(match[3]),
    width: Number(match[4]),
    height: Number(match[5]),
  }));
}
