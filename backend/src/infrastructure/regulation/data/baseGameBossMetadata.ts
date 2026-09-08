import type {
  BossEncounter,
  BossLocationType,
  BossProgression,
  BossRegion,
} from "../../../features/bosses/domain/boss.types";

const ENCOUNTER_OVERRIDES_BY_BOSS_ID: Readonly<Record<string, readonly BossEncounter[]>> = {
  "ancestor-spirit": [
    { region: "siofra-river", location: "Siofra River Bank", locationType: "open-world" },
  ],
  "astel-naturalborn-of-the-void": [
    { region: "lake-of-rot", location: "Grand Cloister", locationType: "dungeon" },
  ],
  "beast-clergyman": [
    { region: "crumbling-farum-azula", location: "Beside the Great Bridge", locationType: "legacy-dungeon" },
  ],
  "black-blade-kindred-47700250": [
    { region: "forbidden-lands", location: null, locationType: "open-world" },
  ],
  "cleanrot-knight-sickle": [
    { region: "dragonbarrow", location: "Abandoned Cave", locationType: "cave" },
  ],
  "cleanrot-knight-spear": [
    { region: "dragonbarrow", location: "Abandoned Cave", locationType: "cave" },
  ],
  "crucible-knight-siluria": [
    { region: "deeproot-depths", location: null, locationType: "open-world" },
  ],
  "death-rite-bird-49801020": [
    { region: "liurnia", location: "Gate Town North", locationType: "open-world" },
  ],
  "dragonkin-soldier-46500262": [
    { region: "ainsel-river", location: null, locationType: "open-world" },
  ],
  "dragonkin-soldier-of-nokstella": [
    { region: "ainsel-river", location: null, locationType: "open-world" },
  ],
  "glintstone-dragon-adula-45021920": [
    { region: "liurnia", location: "Three Sisters", locationType: "open-world" },
  ],
  "glintstone-dragon-smarag": [
    { region: "liurnia", location: "Temple Quarter", locationType: "open-world" },
  ],
  "grave-warden-duelist-34001133": [
    { region: "leyndell", location: "Auriza Side Tomb", locationType: "dungeon" },
  ],
  "hoarah-loux-warrior": [
    { region: "leyndell", location: "Elden Throne", locationType: "legacy-dungeon" },
  ],
  "kindred-of-rot-38102932": [
    { region: "altus-plateau", location: null, locationType: null },
  ],
  "lichdragon-fortissax": [
    { region: "deeproot-depths", location: null, locationType: "open-world" },
  ],
  "loretta-knight-of-the-haligtree": [
    { region: "miquellas-haligtree", location: null, locationType: "legacy-dungeon" },
  ],
  "malenia-blade-of-miquella": [
    { region: "miquellas-haligtree", location: null, locationType: "legacy-dungeon" },
  ],
  "malenia-goddess-of-rot": [
    { region: "miquellas-haligtree", location: null, locationType: "legacy-dungeon" },
  ],
  "maliketh-the-black-blade": [
    { region: "crumbling-farum-azula", location: "Beside the Great Bridge", locationType: "legacy-dungeon" },
  ],
  "mimic-tear": [
    { region: "siofra-river", location: null, locationType: "open-world" },
  ],
  "miranda-blossom": [
    { region: "weeping-peninsula", location: "Tombsward Cave", locationType: "cave" },
  ],
  "mohg-lord-of-blood": [
    { region: "mohgwyn-palace", location: null, locationType: "legacy-dungeon" },
  ],
  "nights-cavalry-31500020": [
    { region: "liurnia", location: "Gate Town Bridge", locationType: "open-world" },
    { region: "liurnia", location: "Bellum Church", locationType: "open-world" },
  ],
  "putrid-crystalian-ringblade": [
    { region: "caelid", location: "Sellia Hideaway", locationType: "cave" },
  ],
  "putrid-crystalian-spear": [
    { region: "caelid", location: "Sellia Hideaway", locationType: "cave" },
  ],
  "putrid-crystalian-staff": [
    { region: "caelid", location: "Sellia Hideaway", locationType: "cave" },
  ],
  "red-wolf-of-radagon": [
    { region: "liurnia", location: "Academy of Raya Lucaria", locationType: "legacy-dungeon" },
  ],
  "rennala-queen-of-the-full-moon-20300024": [
    { region: "liurnia", location: "Academy of Raya Lucaria", locationType: "legacy-dungeon" },
  ],
  "rennala-queen-of-the-full-moon-20310024": [
    { region: "liurnia", location: "Academy of Raya Lucaria", locationType: "legacy-dungeon" },
  ],
};

const LOCATION_BY_BOSS_ID: Readonly<Record<string, {
  location: string;
  locationType: BossLocationType;
}>> = {
  "abductor-virgin-swinging-sickle": { location: "Subterranean Inquisition Chamber", locationType: "legacy-dungeon" },
  "abductor-virgin-wheel": { location: "Subterranean Inquisition Chamber", locationType: "legacy-dungeon" },
  "ancient-dragon-lansseax": { location: "Rampartside Path", locationType: "open-world" },
  "ancient-hero-of-zamor-71000030": { location: "Sainted Hero's Grave", locationType: "heroes-grave" },
  "ancient-hero-of-zamor-71000950": { location: "Giant-Conquering Hero's Grave", locationType: "heroes-grave" },
  "astel-stars-of-darkness": { location: "Yelough Anix Tunnel", locationType: "tunnel" },
  "beastman-of-farum-azula": { location: "Groveside Cave", locationType: "cave" },
  "beastman-of-farum-azula-cleaver": { location: "Dragonbarrow Cave", locationType: "cave" },
  "beastman-of-farum-azula-throwing-knife": { location: "Dragonbarrow Cave", locationType: "cave" },
  "bell-bearing-hunter-31000010": { location: "Warmaster's Shack", locationType: "open-world" },
  "bell-bearing-hunter-31000020": { location: "Church of Vows", locationType: "open-world" },
  "bell-bearing-hunter-31000033": { location: "Hermit Merchant's Shack", locationType: "open-world" },
  "bell-bearing-hunter-31000042": { location: "Isolated Merchant's Shack", locationType: "open-world" },
  "black-blade-kindred-47701242": { location: "Bestial Sanctum", locationType: "dungeon" },
  "black-knife-assassin-21000820": { location: "Black Knife Catacombs", locationType: "catacomb" },
  "black-knife-assassin-21001010": { location: "Deathtouched Catacombs", locationType: "catacomb" },
  "bloodhound-knight": { location: "Lakeside Crystal Cave", locationType: "cave" },
  "borealis-the-freezing-fog": { location: "Freezing Lake", locationType: "open-world" },
  "cemetery-shade-36640012": { location: "Tombsward Catacombs", locationType: "catacomb" },
  "cemetery-shade-36640040": { location: "Caelid Catacombs", locationType: "catacomb" },
  "cemetery-shade-36640920": { location: "Black Knife Catacombs", locationType: "catacomb" },
  "cleanrot-knight": { location: "Stillwater Cave", locationType: "cave" },
  "commander-niall": { location: "Castle Sol", locationType: "dungeon" },
  "commander-oneil": { location: "Swamp of Aeonia", locationType: "open-world" },
  "crucible-knight-25000941": { location: "Redmane Castle", locationType: "dungeon" },
  "crucible-knight-25001933": { location: "Auriza Hero's Grave", locationType: "heroes-grave" },
  "crucible-knight-ordovis": { location: "Auriza Hero's Grave", locationType: "heroes-grave" },
  "crystalian-ringblade": { location: "Altus Tunnel", locationType: "tunnel" },
  "crystalian-spear-33501920": { location: "Academy Crystal Cave", locationType: "cave" },
  "crystalian-spear-33501930": { location: "Altus Tunnel", locationType: "tunnel" },
  "crystalian-staff": { location: "Academy Crystal Cave", locationType: "cave" },
  "death-rite-bird-49801020": { location: "Gate Town North", locationType: "dungeon" },
  "death-rite-bird-49801040": { location: "Southern Aeonia Swamp Bank", locationType: "open-world" },
  "deathbird-49800020": { location: "Scenic Isle", locationType: "open-world" },
  "decaying-ekzykes": { location: "Church of the Plague", locationType: "open-world" },
  "demi-human-chief": { location: "Coastal Cave", locationType: "cave" },
  "demi-human-queen-gilika": { location: "Lux Ruins", locationType: "dungeon" },
  "demi-human-queen-maggie": { location: "Hermit Village", locationType: "dungeon" },
  "demi-human-queen-margot": { location: "Volcano Cave", locationType: "cave" },
  "draconic-tree-sentinel": { location: "Capital Rampart", locationType: "open-world" },
  "dragonkin-soldier-46500265": { location: "Siofra River Bank", locationType: "open-world" },
  "dragonlord-placidusax": { location: "Beside the Great Bridge", locationType: "legacy-dungeon" },
  "elden-beast": { location: "Fractured Marika", locationType: "legacy-dungeon" },
  "elemer-of-the-briar": { location: "The Shaded Castle", locationType: "dungeon" },
  "erdtree-avatar-48100012": { location: "Minor Erdtree", locationType: "open-world" },
  "erdtree-avatar-48100150": { location: "Minor Erdtree", locationType: "open-world" },
  "erdtree-burial-watchdog-42600110": { location: "Stormfoot Catacombs", locationType: "catacomb" },
  "erdtree-burial-watchdog-42600512": { location: "Impaler's Catacombs", locationType: "catacomb" },
  "erdtree-burial-watchdog-42601920": { location: "Cliffbottom Catacombs", locationType: "catacomb" },
  "erdtree-burial-watchdog-42602932": { location: "Wyndham Catacombs", locationType: "catacomb" },
  "erdtree-burial-watchdog-scepter": { location: "Minor Erdtree Catacombs", locationType: "catacomb" },
  "erdtree-burial-watchdog-sword": { location: "Minor Erdtree Catacombs", locationType: "catacomb" },
  "fallingstar-beast-46801930": { location: "Starfall Crater", locationType: "open-world" },
  "fallingstar-beast-46801940": { location: "Sellia Crystal Tunnel", locationType: "tunnel" },
  "fell-twin-21403050": { location: "Divine Tower of East Altus", locationType: "legacy-dungeon" },
  "fell-twin-21403150": { location: "Divine Tower of East Altus", locationType: "legacy-dungeon" },
  "fire-giant": { location: "Flame Peak", locationType: "open-world" },
  "flying-dragon-agheel": { location: "Agheel Lake", locationType: "open-world" },
  "flying-dragon-greyll": { location: "Greyoll's Dragonbarrow", locationType: "open-world" },
  "frenzied-duelist": { location: "Gaol Cave", locationType: "cave" },
  "full-grown-fallingstar-beast": { location: "Ninth Mt. Gelmir Campsite", locationType: "open-world" },
  "glintstone-dragon-adula-45021920": { location: "Moonlight Altar", locationType: "open-world" },
  "glintstone-dragon-adula-45021922": { location: "Moonlight Altar", locationType: "open-world" },
  "glintstone-dragon-smarag": { location: "Temple Quarter", locationType: "dungeon" },
  "god-devouring-serpent": { location: "Volcano Manor", locationType: "legacy-dungeon" },
  "godrick-the-grafted": { location: "Stormveil Castle", locationType: "legacy-dungeon" },
  "godskin-apostle-35600030": { location: "Dominula, Windmill Village", locationType: "dungeon" },
  "godskin-apostle-35600042": { location: "Divine Tower of Caelid", locationType: "open-world" },
  "godskin-apostle-35600950": { location: "Spiritcaller Cave", locationType: "cave" },
  "godskin-duo": { location: "Dragon Temple Altar", locationType: "legacy-dungeon" },
  "godskin-noble-35700038": { location: "Temple of Eiglay", locationType: "legacy-dungeon" },
  "godskin-noble-35700950": { location: "Spiritcaller Cave", locationType: "cave" },
  "grave-warden-duelist-34001110": { location: "Murkwater Catacombs", locationType: "catacomb" },
  "grave-warden-duelist-34001133": { location: "Auriza Side Tomb", locationType: "open-world" },
  "guardian-golem": { location: "Highroad Cave", locationType: "cave" },
  "kindred-of-rot-38100932": { location: "Seethewater Cave", locationType: "cave" },
  "leonine-misbegotten": { location: "Morne Moangrave", locationType: "open-world" },
  "mad-pumpkin-head": { location: "Waypoint Ruins", locationType: "dungeon" },
  "mad-pumpkin-head-flail": { location: "Caelem Ruins", locationType: "dungeon" },
  "mad-pumpkin-head-hammer": { location: "Caelem Ruins", locationType: "dungeon" },
  "magma-wyrm-49100032": { location: "Fort Laiedd", locationType: "open-world" },
  "magma-wyrm-49100940": { location: "Gael Tunnel", locationType: "tunnel" },
  "magma-wyrm-makar": { location: "Ruin-Strewn Precipice", locationType: "dungeon" },
  "margit-the-fell-omen": { location: "Stormveil Castle", locationType: "legacy-dungeon" },
  "miranda-the-blighted-bloom": { location: "Perfumer's Grotto", locationType: "cave" },
  "misbegotten-crusader": { location: "Cave of the Forlorn", locationType: "cave" },
  "misbegotten-warrior-34600930": { location: "Unsightly Catacombs", locationType: "catacomb" },
  "misbegotten-warrior-34600941": { location: "Redmane Castle", locationType: "dungeon" },
  "mohg-the-omen": { location: "Cathedral of the Forsaken", locationType: "legacy-dungeon" },
  "morgott-the-omen-king": { location: "Elden Throne", locationType: "legacy-dungeon" },
  "nights-cavalry-31500042": { location: "Lenne's Rise", locationType: "open-world" },
  "nights-cavalry-31501012": { location: "Castle Morne Rampart", locationType: "dungeon" },
  "nights-cavalry-31501030": { location: "Altus Highway Junction", locationType: "open-world" },
  "nights-cavalry-31501040": { location: "Caelid Highway South", locationType: "open-world" },
  "nights-cavalry-flail": { location: "Inner Consecrated Snowfield", locationType: "open-world" },
  "nights-cavalry-glaive": { location: "Inner Consecrated Snowfield", locationType: "open-world" },
  "nox-monk": { location: "Sellia, Town of Sorcery", locationType: "dungeon" },
  "nox-swordstress": { location: "Sellia, Town of Sorcery", locationType: "dungeon" },
  "omenkiller-48200920": { location: "Village of the Albinaurics", locationType: "dungeon" },
  "omenkiller-48200930": { location: "Perfumer's Grotto", locationType: "cave" },
  "onyx-lord": { location: "Sealed Tunnel", locationType: "tunnel" },
  "perfumer-tricia": { location: "Unsightly Catacombs", locationType: "catacomb" },
  "putrid-avatar-48110040": { location: "Minor Erdtree", locationType: "open-world" },
  "putrid-avatar-48110042": { location: "Minor Erdtree", locationType: "open-world" },
  "putrid-avatar-48110052": { location: "Minor Erdtree", locationType: "open-world" },
  "putrid-crystalian-ringblade": { location: "Sellia Hideaway", locationType: "open-world" },
  "putrid-crystalian-spear": { location: "Sellia Hideaway", locationType: "open-world" },
  "putrid-crystalian-staff": { location: "Sellia Hideaway", locationType: "open-world" },
  "putrid-grave-warden-duelist": { location: "Consecrated Snowfield Catacombs", locationType: "catacomb" },
  "putrid-tree-spirit": { location: "War-Dead Catacombs", locationType: "catacomb" },
  "radagon-of-the-golden-order": { location: "Fractured Marika", locationType: "legacy-dungeon" },
  "red-wolf-of-the-champion": { location: "Gelmir Hero's Grave", locationType: "heroes-grave" },
  "regal-ancestor-spirit": { location: "Hallowhorn Grounds", locationType: "open-world" },
  "royal-knight-loretta": { location: "Caria Manor", locationType: "dungeon" },
  "royal-revenant": { location: "Kingsrealm Ruins", locationType: "dungeon" },
  "runebear": { location: "Earthbore Cave", locationType: "cave" },
  "rykard-lord-of-blasphemy": { location: "Volcano Manor", locationType: "legacy-dungeon" },
  "sanguine-noble": { location: "Writheblood Ruins", locationType: "dungeon" },
  "scaly-misbegotten": { location: "Morne Tunnel", locationType: "tunnel" },
  "soldier-of-godrick": { location: "Stranded Graveyard", locationType: "open-world" },
  "spiritcaller-snail-41402920": { location: "Road's End Catacombs", locationType: "catacomb" },
  "spiritcaller-snail-41402950": { location: "Spiritcaller Cave", locationType: "cave" },
  "starscourge-radahn": { location: "Wailing Dunes", locationType: "open-world" },
  "stonedigger-troll-46030910": { location: "Limgrave Tunnels", locationType: "tunnel" },
  "stonedigger-troll-46030930": { location: "Old Altus Tunnel", locationType: "tunnel" },
  "stray-mimic-tear": { location: "Hidden Path to the Haligtree", locationType: "dungeon" },
  "tibia-mariner-49500010": { location: "Summonwater Village", locationType: "dungeon" },
  "tibia-mariner-49500032": { location: "Wyndham Ruins", locationType: "dungeon" },
  "tree-sentinel-32510010": { location: "Church of Elleh", locationType: "open-world" },
  "ulcerated-tree-spirit-46400007": { location: "Fringefolk Hero's Grave", locationType: "heroes-grave" },
  "ulcerated-tree-spirit-46400032": { location: "Minor Erdtree", locationType: "open-world" },
  "ulcerated-tree-spirit-46400950": { location: "Giants' Mountaintop Catacombs", locationType: "catacomb" },
  "valiant-gargoyle": { location: "Siofra Aqueduct", locationType: "dungeon" },
  "valiant-gargoyle-twinblade": { location: "Siofra Aqueduct", locationType: "dungeon" },
  "wormface": { location: "Minor Erdtree", locationType: "open-world" },
};

const GREAT_RUNE_BOSS_IDS = new Set([
  "godrick-the-grafted",
  "malenia-goddess-of-rot",
  "mohg-lord-of-blood",
  "morgott-the-omen-king",
  "rennala-queen-of-the-full-moon-20310024",
  "rykard-lord-of-blasphemy",
  "starscourge-radahn",
]);

const REMEMBRANCE_BOSS_IDS = new Set([
  "astel-naturalborn-of-the-void",
  "dragonlord-placidusax",
  "elden-beast",
  "fire-giant",
  "godrick-the-grafted",
  "hoarah-loux-warrior",
  "lichdragon-fortissax",
  "malenia-goddess-of-rot",
  "maliketh-the-black-blade",
  "mohg-lord-of-blood",
  "morgott-the-omen-king",
  "regal-ancestor-spirit",
  "rennala-queen-of-the-full-moon-20310024",
  "rykard-lord-of-blasphemy",
  "starscourge-radahn",
]);

const REQUIRED_BOSS_IDS = new Set([
  "beast-clergyman",
  "elden-beast",
  "fire-giant",
  "godfrey-first-elden-lord-47210070",
  "godskin-duo",
  "hoarah-loux-warrior",
  "maliketh-the-black-blade",
  "morgott-the-omen-king",
  "radagon-of-the-golden-order",
]);

const ROUTE_DEPENDENT_BOSS_IDS = new Set([
  "draconic-tree-sentinel",
  "god-devouring-serpent",
  "godrick-the-grafted",
  "godskin-noble-35700038",
  "margit-the-fell-omen",
  "mohg-lord-of-blood",
  "red-wolf-of-radagon",
  "rennala-queen-of-the-full-moon-20300024",
  "rennala-queen-of-the-full-moon-20310024",
  "rykard-lord-of-blasphemy",
  "starscourge-radahn",
]);

const REGION_BY_MAP_SUFFIX: Readonly<Record<number, BossRegion>> = {
  6: "limgrave",
  7: "limgrave",
  8: "limgrave",
  10: "limgrave",
  12: "weeping-peninsula",
  13: "weeping-peninsula",
  14: "limgrave",
  20: "liurnia",
  21: "liurnia",
  22: "liurnia",
  24: "liurnia",
  26: "liurnia",
  30: "altus-plateau",
  31: "altus-plateau",
  32: "mt-gelmir",
  33: "leyndell",
  34: "leyndell",
  35: "leyndell",
  38: "mt-gelmir",
  40: "caelid",
  41: "caelid",
  42: "dragonbarrow",
  50: "mountaintops-of-the-giants",
  51: "mountaintops-of-the-giants",
  52: "consecrated-snowfield",
  54: "miquellas-haligtree",
  56: "miquellas-haligtree",
  60: "ainsel-river",
  62: "lake-of-rot",
  64: "siofra-river",
  65: "siofra-river",
  66: "deeproot-depths",
  68: "mohgwyn-palace",
  70: "leyndell",
  72: "crumbling-farum-azula",
  78: "leyndell",
};

export function getBaseGameBossMetadata(id: string, npcParamId: number) {
  const progression = getProgression(id);
  const rewardsGreatRune = GREAT_RUNE_BOSS_IDS.has(id);
  const rewardsRemembrance = REMEMBRANCE_BOSS_IDS.has(id);
  const location = LOCATION_BY_BOSS_ID[id];
  const encounters = ENCOUNTER_OVERRIDES_BY_BOSS_ID[id] ?? [{
    region: getRegion(id, npcParamId),
    location: location?.location ?? null,
    locationType: location?.locationType ?? null,
  }];

  return {
    encounters: encounters.map((encounter) => ({ ...encounter })),
    rank: progression !== "optional" || rewardsGreatRune || rewardsRemembrance
      ? "major" as const
      : "minor" as const,
    progression,
    rewardsGreatRune,
    rewardsRemembrance,
  };
}

function getProgression(id: string): BossProgression {
  if (REQUIRED_BOSS_IDS.has(id)) return "required";
  if (ROUTE_DEPENDENT_BOSS_IDS.has(id)) return "route-dependent";
  return "optional";
}

function getRegion(id: string, npcParamId: number): BossRegion {
  if (id === "dragonkin-soldier-46500262") return "ainsel-river";
  if (id === "black-blade-kindred-47700250" || id === "nights-cavalry-31500050") {
    return "forbidden-lands";
  }
  if (id.startsWith("fell-twin-")) return "leyndell";
  if (id === "erdtree-burial-watchdog-42602932" || id === "tibia-mariner-49500032"
      || id === "kindred-of-rot-38102932") {
    return "altus-plateau";
  }
  const region = REGION_BY_MAP_SUFFIX[npcParamId % 100];
  if (!region) throw new Error(`Missing region mapping for boss ${id}`);
  return region;
}
