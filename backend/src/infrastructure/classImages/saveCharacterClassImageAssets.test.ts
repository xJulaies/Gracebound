import { afterEach, describe, expect, it } from "vitest";
import { CharacterClassImageAssetModel } from "../../features/assets/models/characterClassImageAsset.model";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { saveCharacterClassImageAssets } from "./saveCharacterClassImageAssets";

describe("saveCharacterClassImageAssets", () => {
  useMongoMemoryServer({ replicaSet: true });
  afterEach(() => CharacterClassImageAssetModel.deleteMany({}));

  const metadata = { gameVersion: "1.17.0", sourceHash: "b".repeat(64) };

  it("replaces one game-version dataset transactionally", async () => {
    await saveCharacterClassImageAssets(createAssets("a"), metadata);
    await saveCharacterClassImageAssets(createAssets("c"), metadata);

    const records = await CharacterClassImageAssetModel.find({}).lean();
    expect(records).toHaveLength(10);
    expect(records.every(({ checksum }) => checksum === "c".repeat(64))).toBe(true);
  });

  it("rejects duplicate class IDs", async () => {
    const assets = createAssets("a");
    assets[1] = { ...assets[1]!, classId: assets[0]!.classId };

    await expect(saveCharacterClassImageAssets(assets, metadata)).rejects.toThrow(
      "duplicate classes",
    );
  });
});

function createAssets(checksumCharacter: string) {
  return [
    "vagabond", "warrior", "hero", "bandit", "astrologer",
    "prophet", "samurai", "prisoner", "confessor", "wretch",
  ].map((classId) => ({
    classId,
    checksum: checksumCharacter.repeat(64),
    mimeType: "image/webp" as const,
    width: 520,
    height: 624,
    size: 4,
    data: Buffer.from("webp"),
  }));
}
