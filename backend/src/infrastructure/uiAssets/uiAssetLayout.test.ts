import { describe, expect, it } from "vitest";
import { parseUiAssetLayout } from "./uiAssetLayout";

describe("parseUiAssetLayout", () => {
  it("maps named subtextures to their atlas coordinates", () => {
    expect(parseUiAssetLayout(`
      <TextureAtlas imagePath="SB_MainMenu.png">
        <SubTexture name="MENU_SlotBase.png" x="10" y="20" width="314" height="318" half="0"/>
      </TextureAtlas>
    `)).toEqual([{
      name: "MENU_SlotBase",
      atlasName: "SB_MainMenu",
      x: 10,
      y: 20,
      width: 314,
      height: 318,
    }]);
  });

  it("rejects a layout without an atlas", () => {
    expect(() => parseUiAssetLayout("<SubTexture />")).toThrow(
      "Layout does not declare a texture atlas",
    );
  });
});
