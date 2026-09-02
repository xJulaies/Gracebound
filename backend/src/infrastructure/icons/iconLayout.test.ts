import { describe, expect, it } from "vitest";
import { indexIconLayouts, parseIconLayout } from "./iconLayout";

describe("parseIconLayout", () => {
  it("maps exact item icon entries and ignores decorated names", () => {
    const source = `<TextureAtlas imagePath="SB_Icon_06.png">
      <SubTexture name="MENU_ItemIcon_18100.png" x="1476" y="0" width="160" height="160" half="0"/>
      <SubTexture name="MENU_ItemIcon_18100d.png" x="0" y="0" width="160" height="160" half="0"/>
    </TextureAtlas>`;

    expect(parseIconLayout(source)).toEqual([{
      iconId: 18100,
      atlasName: "SB_Icon_06",
      x: 1476,
      y: 0,
      width: 160,
      height: 160,
    }]);
  });

  it("rejects layouts without an atlas", () => {
    expect(() => parseIconLayout("<SubTexture />")).toThrow(
      "Layout does not declare a texture atlas",
    );
  });
});

describe("indexIconLayouts", () => {
  const entry = {
    iconId: 18100,
    atlasName: "SB_Icon_06",
    x: 1476,
    y: 0,
    width: 160,
    height: 160,
  };

  it("deduplicates identical ID mappings", () => {
    expect(indexIconLayouts([entry, entry])).toEqual(new Map([[18100, entry]]));
  });

  it("rejects conflicting ID mappings", () => {
    expect(() => indexIconLayouts([entry, { ...entry, x: 0 }])).toThrow(
      "Icon 18100 has conflicting layout locations",
    );
  });
});
