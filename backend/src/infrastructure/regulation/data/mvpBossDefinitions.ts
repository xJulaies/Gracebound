import type { RegulationBossDefinition } from "../mappers/mapRegulationBoss";

export const mvpBossDefinitions = [
  {
    id: "margit-the-fell-omen",
    name: "Margit, the Fell Omen",
    npcParamId: 21300014,
  },
  {
    id: "godrick-the-grafted",
    name: "Godrick the Grafted",
    npcParamId: 47500014,
  },
  {
    id: "rennala-queen-of-the-full-moon",
    name: "Rennala, Queen of the Full Moon",
    npcParamId: 20310024,
  },
  {
    id: "starscourge-radahn",
    name: "Starscourge Radahn",
    npcParamId: 47300040,
  },
  {
    id: "morgott-the-omen-king",
    name: "Morgott, the Omen King",
    npcParamId: 21300534,
  },
  {
    id: "fire-giant",
    name: "Fire Giant",
    // The phase-one row 47600050 is the transition damage pool. This row owns
    // the full encounter health that continues into phase two.
    npcParamId: 47601050,
  },
  {
    id: "maliketh-the-black-blade",
    name: "Maliketh, the Black Blade",
    npcParamId: 21101072,
  },
  {
    id: "hoarah-loux-warrior",
    name: "Hoarah Loux, Warrior",
    npcParamId: 47210070,
  },
  {
    id: "radagon-of-the-golden-order",
    name: "Radagon of the Golden Order",
    npcParamId: 21900078,
  },
  {
    id: "elden-beast",
    name: "Elden Beast",
    npcParamId: 22000078,
  },
] as const satisfies readonly RegulationBossDefinition[];
