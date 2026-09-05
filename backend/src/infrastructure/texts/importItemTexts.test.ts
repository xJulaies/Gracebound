import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { ItemTextCatalogs } from "./parseSmithboxTextExport";
import { importItemTexts } from "./importItemTexts";

describe("importItemTexts", () => {
  useMongoMemoryServer({ replicaSet: true });

  it("updates matching catalog records without inserting raw text records", async () => {
    await mongoose.connection.collection("weapons").insertMany([
      { id: "longsword", sourceId: 100, gameVersion: "1.17.0" },
      { id: "other-version", sourceId: 100, gameVersion: "1.16.0" },
    ]);
    const catalogs = emptyCatalogs();
    catalogs.weapons.set(100, {
      title: "Longsword",
      summary: null,
      description: "A straight sword.",
    });

    const result = await importItemTexts(catalogs, "1.17.0");

    expect(result[0]).toEqual({
      collection: "weapons",
      records: 1,
      matched: 1,
      withSummary: 0,
      withDescription: 1,
    });
    expect(await mongoose.connection.collection("weapons").findOne({ id: "longsword" }))
      .toMatchObject({ summary: null, description: "A straight sword." });
    expect(await mongoose.connection.collection("weapons").findOne({ id: "other-version" }))
      .not.toHaveProperty("description");
  });

  it("does not change records during a dry run", async () => {
    await mongoose.connection.collection("talismans").insertOne({
      id: "axe-talisman",
      sourceAccessoryId: 1000,
      gameVersion: "1.17.0",
    });
    const catalogs = emptyCatalogs();
    catalogs.talismans.set(1000, {
      title: "Axe Talisman",
      summary: "Enhances charge attacks",
      description: "A talisman depicting an axe.",
    });

    await importItemTexts(catalogs, "1.17.0", true);

    expect(await mongoose.connection.collection("talismans").findOne({ id: "axe-talisman" }))
      .not.toHaveProperty("description");
  });

  it("enriches embedded unique weapon skills by SwordArtsParam ID", async () => {
    await mongoose.connection.collection("weapons").insertOne({
      id: "moonveil",
      sourceId: 9060000,
      gameVersion: "1.17.0",
      skills: [{
        id: "transient-moonlight",
        name: "Transient Moonlight",
        sourceSwordArtId: 1178,
        attacks: [],
      }],
    });
    const catalogs = emptyCatalogs();
    catalogs.skills.set(1178, {
      title: "Transient Moonlight",
      summary: null,
      description: "Sheathe blade, holding it at the hip.",
    });

    const result = await importItemTexts(catalogs, "1.17.0");
    const weapon = await mongoose.connection.collection("weapons").findOne({
      id: "moonveil",
    });

    expect(result[result.length - 1]).toMatchObject({
      collection: "weaponSkills",
      records: 1,
      matched: 1,
      withDescription: 1,
    });
    expect(weapon?.skills[0]).toMatchObject({
      id: "transient-moonlight",
      description: "Sheathe blade, holding it at the hip.",
    });
  });
});

function emptyCatalogs(): ItemTextCatalogs {
  return {
    weapons: new Map(),
    armor: new Map(),
    talismans: new Map(),
    goods: new Map(),
    ashesOfWar: new Map(),
    skills: new Map(),
  };
}
