export interface IconLayoutEntry {
  iconId: number;
  atlasName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const atlasPattern = /<TextureAtlas\s+imagePath="([^"]+)"/;
const iconPattern = /<SubTexture\s+name="MENU_ItemIcon_(\d+)\.png"\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"\s+height="(\d+)"/g;

export function parseIconLayout(source: string): IconLayoutEntry[] {
  const atlasMatch = atlasPattern.exec(source);
  if (!atlasMatch) throw new Error("Layout does not declare a texture atlas");

  const atlasName = atlasMatch[1].replace(/\.png$/i, "");
  const entries: IconLayoutEntry[] = [];

  for (const match of source.matchAll(iconPattern)) {
    const [, iconId, x, y, width, height] = match;
    entries.push({
      iconId: Number(iconId),
      atlasName,
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    });
  }

  return entries;
}

export function indexIconLayouts(entries: IconLayoutEntry[]): Map<number, IconLayoutEntry> {
  const indexed = new Map<number, IconLayoutEntry>();

  for (const entry of entries) {
    const existing = indexed.get(entry.iconId);
    if (existing && !sameLocation(existing, entry)) {
      throw new Error(`Icon ${entry.iconId} has conflicting layout locations`);
    }
    indexed.set(entry.iconId, entry);
  }

  return indexed;
}

function sameLocation(left: IconLayoutEntry, right: IconLayoutEntry): boolean {
  return left.atlasName === right.atlasName
    && left.x === right.x
    && left.y === right.y
    && left.width === right.width
    && left.height === right.height;
}
