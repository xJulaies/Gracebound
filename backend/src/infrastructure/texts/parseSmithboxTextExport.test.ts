import { describe, expect, it } from "vitest";
import { parseSmithboxTextExport } from "./parseSmithboxTextExport";

describe("parseSmithboxTextExport", () => {
  it("combines valid base-game title, summary, and description entries by ID", () => {
    const result = parseSmithboxTextExport(JSON.stringify({
      FmgWrappers: [
        wrapper("WeaponName.fmg", [{ ID: 100, Text: " Longsword " }, { ID: 200, Text: "[ERROR]" }]),
        wrapper("WeaponInfo.fmg", [{ ID: 100, Text: "Straight sword" }]),
        wrapper("WeaponCaption.fmg", [{ ID: 100, Text: "Line one.\r\nLine two." }]),
        wrapper("WeaponCaption_dlc01.fmg", [
          { ID: 100, Text: "Patched description" },
          { ID: 300, Text: "DLC text" },
        ]),
        wrapper("ArtsName.fmg", [{ ID: 1178, Text: "Transient Moonlight" }]),
        wrapper("ArtsCaption.fmg", [{ ID: 1178, Text: "Sheathe blade, holding it at the hip." }]),
      ],
    }));

    expect(result.weapons.get(100)).toEqual({
      title: "Longsword",
      summary: "Straight sword",
      description: "Patched description",
    });
    expect(result.weapons.get(200)).toBeUndefined();
    expect(result.weapons.get(300)?.description).toBe("DLC text");
    expect(result.skills.get(1178)).toEqual({
      title: "Transient Moonlight",
      summary: null,
      description: "Sheathe blade, holding it at the hip.",
    });
  });

  it("rejects malformed Smithbox exports", () => {
    expect(() => parseSmithboxTextExport('{"FmgWrappers":{}}')).toThrow();
  });
});

function wrapper(Name: string, Entries: Array<{ ID: number; Text: string | null }>) {
  return { Name, Fmg: { Entries } };
}
