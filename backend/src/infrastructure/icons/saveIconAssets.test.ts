import { afterEach, describe, expect, it } from "vitest";
import { IconAssetModel } from "../../features/assets/models/iconAsset.model";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { saveIconAssets } from "./saveIconAssets";

describe("saveIconAssets", () => {
  useMongoMemoryServer({ replicaSet: true });
  afterEach(() => IconAssetModel.deleteMany({}));

  const asset = {
    checksum: "a".repeat(64), iconIds: [6000], mimeType: "image/webp" as const,
    width: 160, height: 160, size: 4, data: Buffer.from("webp"),
  };
  const metadata = { gameVersion: "1.17.0", sourceHash: "b".repeat(64) };

  it("replaces one game-version dataset transactionally", async () => {
    await saveIconAssets([asset], metadata);
    await saveIconAssets([{ ...asset, checksum: "c".repeat(64), iconIds: [6015] }], metadata);

    const records = await IconAssetModel.find({}).lean();
    expect(records).toHaveLength(1);
    expect(records[0].iconIds).toEqual([6015]);
  });

  it("rejects icon IDs mapped to multiple assets", async () => {
    await expect(saveIconAssets([
      asset,
      { ...asset, checksum: "c".repeat(64) },
    ], metadata)).rejects.toThrow("duplicate IDs");
  });
});
