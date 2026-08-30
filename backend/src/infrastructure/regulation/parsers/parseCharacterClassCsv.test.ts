import { describe, expect, it } from "vitest";
import {
  parseCharacterInitialStatsCsv,
  parseClassSelectionCsv,
} from "./parseCharacterClassCsv";

describe("character class CSV parsers", () => {
  it("accepts Smithbox's trailing empty header column", () => {
    expect(parseClassSelectionCsv([
      "ID,Name,originChrInitParam,",
      "2000,Vagabond,3000",
    ].join("\n"))).toEqual([{ ID: 2000, Name: "Vagabond", originChrInitParam: 3000 }]);
  });

  it("maps the eight initial attributes", () => {
    expect(parseCharacterInitialStatsCsv([
      "ID,soulLv,baseVit,baseWil,baseEnd,baseStr,baseDex,baseMag,baseFai,baseLuc,",
      "3000,9,15,10,11,14,13,9,9,7",
    ].join("\n"))).toEqual([{
      ID: 3000, soulLv: 9, baseVit: 15, baseWil: 10, baseEnd: 11,
      baseStr: 14, baseDex: 13, baseMag: 9, baseFai: 9, baseLuc: 7,
    }]);
  });

  it("accepts zero values belonging to unrelated internal rows", () => {
    expect(parseCharacterInitialStatsCsv([
      "ID,soulLv,baseVit,baseWil,baseEnd,baseStr,baseDex,baseMag,baseFai,baseLuc,",
      "0,0,0,0,0,0,0,0,0,0",
    ].join("\n"))).toHaveLength(1);
  });
});
