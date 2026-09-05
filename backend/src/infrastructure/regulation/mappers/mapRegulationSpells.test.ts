import { describe, expect, it } from "vitest";
import type { MagicParamRow } from "../schemas/magic.schema";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import type { SpellData } from "../../../features/spells/domain/spell.types";
import { mapBaseGameSpells } from "./mapRegulationSpells";

describe("mapBaseGameSpells", () => {
  it("uses the matching goods icon as the stable item asset ID", () => {
    const [spell] = mapBaseGameSpells(
      [row(4000, "[Sorcery] Glintstone Pebble")],
      undefined,
      [{ ID: 4000, iconId: 6000 }],
    );

    expect(spell.iconId).toBe(6000);
  });
  it("normalizes playable spell selection data", () => {
    expect(mapBaseGameSpells([row(4000, "[Sorcery] Glintstone Pebble")])).toEqual([{
      id: "glintstone-pebble", sourceMagicId: 4000, name: "Glintstone Pebble",
      type: "sorcery", schools: ["glintstone"], fpCost: 7, chargedFpCost: null, sustainedFpCost: null, slotsRequired: 1,
      requirements: { intelligence: 10, faith: 0, arcane: 0 },
      iconId: 4000, calculationStatus: "catalog-only", buffEffect: null, attack: null, chargedAttack: null,
    }]);
  });

  it("excludes NPC, unused, duplicate casting, and DLC rows", () => {
    expect(mapBaseGameSpells([
      row(4641, "[Sorcery] Carian Retaliation (Unused 1)"),
      row(8000, "[Incantation] Briars of Sin"),
      row(50_000, "[NPC: Sorcery] Glintstone Pebble"),
      row(2_004_000, "[Sorcery] Glintstone Nail"),
    ])).toEqual([]);
  });

  it("corrects known internal casting-category mismatches", () => {
    expect(mapBaseGameSpells([
      row(5040, "[Sorcery] Death Lightning"),
      row(6500, "[Incantation] Night Maiden's Mist"),
    ]).map(({ name, type }) => ({ name, type }))).toEqual([
      { name: "Death Lightning", type: "incantation" },
      { name: "Night Maiden's Mist", type: "sorcery" },
    ]);
  });

  it("maps the verified Glintstone Pebble projectile attack", () => {
    const magic = { ...row(4000, "[Sorcery] Glintstone Pebble"), refCategory1: 1, refId1: 10400000 };
    const [spell] = mapBaseGameSpells([magic], {
      bullets: [{ ID: 10400000, Name: "Glintstone Pebble", atkId_Bullet: 40000, intervalCreateBulletId: -1 }],
      attacks: [{
        ID: 40000, Name: "Glintstone Pebble",
        atkPhysCorrection: 100, atkMagCorrection: 100, atkFireCorrection: 100,
        atkThunCorrection: 100, atkDarkCorrection: 100,
        atkPhys: 0, atkMag: 152, atkFire: 0, atkThun: 0, atkDark: 0,
        atkAttribute: 3, isAddBaseAtk: 0, finalDamageRateId: 20000,
      }],
      finalDamageRates: [{
        ID: 20000, Name: "", physRate: 1, magRate: 1,
        fireRate: 1, thunRate: 1, darkRate: 1,
      }],
      effects: [],
    });

    expect(spell).toMatchObject({
      calculationStatus: "supported",
      attack: {
        sourceBulletId: 10400000,
        sourceAttackId: 40000,
        motionValues: { physical: 0, magic: 152, fire: 0, lightning: 0, holy: 0 },
      },
    });
  });

  it("maps additional verified single-hit glintstone projectiles", () => {
    const spells = mapBaseGameSpells([
      { ...row(4001, "[Sorcery] Great Glintstone Shard"), refCategory1: 1, refId1: 10400100 },
      { ...row(4010, "[Sorcery] Swift Glintstone Shard"), refCategory1: 1, refId1: 10401000 },
    ], {
      bullets: [
        { ID: 10400100, Name: "Great Glintstone Shard", atkId_Bullet: 40010, intervalCreateBulletId: -1 },
        { ID: 10401000, Name: "Swift Glintstone Shard", atkId_Bullet: 40100, intervalCreateBulletId: -1 },
      ],
      attacks: [spellAttack(40010, "Great Glintstone Shard", 211), spellAttack(40100, "Swift Glintstone Shard", 114)],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [],
    });

    expect(spells.map(({ id, calculationStatus, attack }) => ({
      id, calculationStatus, magicMotionValue: attack?.motionValues.magic,
    }))).toEqual([
      { id: "great-glintstone-shard", calculationStatus: "supported", magicMotionValue: 211 },
      { id: "swift-glintstone-shard", calculationStatus: "supported", magicMotionValue: 114 },
    ]);
  });

  it("keeps normal and charged projectile profiles separate", () => {
    const spell = mapBaseGameSpells([{
      ...row(4021, "[Sorcery] Comet"), mp: 24, mp_charge: 24,
      refCategory1: 1, refId1: 10402100, refCategory2: 1, refId2: 10402150,
    }], {
      bullets: [
        { ID: 10402100, Name: "Comet", atkId_Bullet: 40210, intervalCreateBulletId: -1 },
        { ID: 10402150, Name: "Comet [Charged]", atkId_Bullet: 40211, intervalCreateBulletId: -1 },
      ],
      attacks: [spellAttack(40210, "Comet", 292), spellAttack(40211, "Comet", 365)],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [],
    })[0];

    expect(spell).toMatchObject({
      id: "comet", calculationStatus: "supported", fpCost: 24, chargedFpCost: 24,
      attack: { sourceAttackId: 40210, motionValues: { magic: 292 } },
      chargedAttack: { sourceAttackId: 40211, motionValues: { magic: 365 } },
    });
  });

  it("maps direct-projectile status buildup separately from damage", () => {
    const spells = mapBaseGameSpells([
      { ...row(4400, "[Sorcery] Glintstone Icecrag"), refCategory1: 1, refId1: 10440000 },
      { ...row(4720, "[Sorcery] Gravity Well"), refCategory1: 1, refId1: 10472000 },
    ], {
      bullets: [
        { ID: 10440000, Name: "Glintstone Icecrag", atkId_Bullet: 44000, intervalCreateBulletId: -1, spEffectId0: 1440000 },
        { ID: 10472000, Name: "Gravity Well", atkId_Bullet: 47200, intervalCreateBulletId: -1, spEffectId0: 470 },
      ],
      attacks: [spellAttack(44000, "Glintstone Icecrag", 199), spellAttack(47200, "Gravity Well", 148)],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [statusEffect(1440000, 100), statusEffect(470, 0)],
    });

    expect(spells.map(({ id, attack }) => ({ id, magic: attack?.motionValues.magic, status: attack?.statusBuildup }))).toEqual([
      { id: "glintstone-icecrag", magic: 199, status: { ...emptyStatusBuildup(), frost: 100 } },
      { id: "gravity-well", magic: 148, status: emptyStatusBuildup() },
    ]);
  });

  it("maps a grouped set of verified single-hit incantation profiles", () => {
    const spells = mapBaseGameSpells([
      chargedRow(6010, "[Incantation] Flame Sling", 10601000, 10601050),
      chargedRow(6410, "[Incantation] Wrath of Gold", 10641000, 10641050),
      { ...row(6700, "[Incantation] Discus of Light"), refCategory1: 1, refId1: 10670000 },
      { ...row(6900, "[Incantation] Lightning Spear"), refCategory1: 1, refId1: 10690000 },
      chargedRow(7320, "[Incantation] Frenzied Burst", 10732000, 10732050),
    ], {
      bullets: [
        bullet(10601000, 60100), bullet(10601050, 60102),
        bullet(10641000, 64100), bullet(10641050, 64105),
        bullet(10670000, 67000), bullet(10690000, 69000),
        { ...bullet(10732000, 73200), spEffectId0: 1732000 },
        { ...bullet(10732050, 73205), spEffectId0: 1732001 },
      ],
      attacks: [
        elementalSpellAttack(60100, "Flame Sling", "fire", 202),
        elementalSpellAttack(60102, "Flame Sling [Charged]", "fire", 255),
        elementalSpellAttack(64100, "Wrath of Gold", "holy", 350),
        elementalSpellAttack(64105, "Wrath of Gold [Charged]", "holy", 420),
        elementalSpellAttack(67000, "Discus of Light", "holy", 150),
        elementalSpellAttack(69000, "Lightning Spear", "lightning", 234),
        elementalSpellAttack(73200, "Frenzied Burst", "fire", 250),
        elementalSpellAttack(73205, "Frenzied Burst [Charged]", "fire", 309),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [statusEffect(1732000, 0, 90), statusEffect(1732001, 0, 105)],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id,
      normal: attack?.motionValues,
      charged: chargedAttack?.motionValues ?? null,
      status: attack?.statusBuildup,
      chargedStatus: chargedAttack?.statusBuildup ?? null,
    }))).toEqual([
      spellProfile("flame-sling", "fire", 202, 255),
      spellProfile("wrath-of-gold", "holy", 350, 420),
      spellProfile("discus-of-light", "holy", 150),
      spellProfile("lightning-spear", "lightning", 234),
      {
        ...spellProfile("frenzied-burst", "fire", 250, 309),
        status: { ...emptyStatusBuildup(), madness: 90 },
        chargedStatus: { ...emptyStatusBuildup(), madness: 105 },
      },
    ]);
  });

  it("maps grouped multi-projectile profiles as per-hit values", () => {
    const spells = mapBaseGameSpells([
      { ...row(4300, "[Sorcery] Glintblade Phalanx"), refCategory1: 1, refId1: 10430000 },
      { ...row(4301, "[Sorcery] Carian Phalanx"), refCategory1: 1, refId1: 10430100 },
      { ...row(4302, "[Sorcery] Greatblade Phalanx"), refCategory1: 1, refId1: 10430200 },
      chargedRow(4721, "[Sorcery] Collapsing Stars", 10472100, 10472101),
      { ...row(6800, "[Incantation] Bestial Sling"), refCategory1: 1, refId1: 10680000 },
      { ...row(7200, "[Incantation] Pest Threads"), refCategory1: 1, refId1: 10720000 },
    ], {
      bullets: [
        bullet(10430000, 43000), bullet(10430100, 43010), bullet(10430200, 43020),
        { ...bullet(10472100, 47210), spEffectId0: 470 },
        { ...bullet(10472101, 47210), spEffectId0: 470 },
        bullet(10680000, 68000), bullet(10720000, 72000),
      ],
      attacks: [
        spellAttack(43000, "Glintblade Phalanx", 60),
        spellAttack(43010, "Carian Phalanx", 48),
        spellAttack(43020, "Greatblade Phalanx", 100),
        spellAttack(47210, "Collapsing Stars", 44),
        physicalSpellAttack(68000, "Bestial Sling", 87),
        physicalSpellAttack(72000, "Pest Threads", 60),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [statusEffect(470, 0)],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id, normal: attack?.motionValues, charged: chargedAttack?.motionValues ?? null,
    }))).toEqual([
      hitProfile("glintblade-phalanx", "magic", 60),
      hitProfile("carian-phalanx", "magic", 48),
      hitProfile("greatblade-phalanx", "magic", 100),
      hitProfile("collapsing-stars", "magic", 44, 44),
      hitProfile("bestial-sling", "physical", 87),
      hitProfile("pest-threads", "physical", 60),
    ]);
  });

  it("maps channeled spells as per-tick profiles with sustained FP cost", () => {
    const spells = mapBaseGameSpells([
      sustainedRow(4060, "[Sorcery] Crystal Barrage", 14, 2, 10406000),
      sustainedRow(4200, "[Sorcery] Comet Azur", 40, 10, 10420000),
      sustainedRow(4520, "[Sorcery] Crystal Torrent", 20, 5, 10452000),
    ], {
      bullets: [
        bullet(10406000, 40600), bullet(10420000, 42000), bullet(10452000, 45200),
      ],
      attacks: [
        spellAttack(40600, "Crystal Barrage", 36),
        spellAttack(42000, "Comet Azur", 55),
        spellAttack(45200, "Crystal Torrent", 57),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [],
    });

    expect(spells.map(({ id, fpCost, sustainedFpCost, chargedFpCost, attack }) => ({
      id, fpCost, sustainedFpCost, chargedFpCost,
      outputUnit: attack?.outputUnit,
      magicMotionValue: attack?.motionValues.magic,
    }))).toEqual([
      { id: "crystal-barrage", fpCost: 14, sustainedFpCost: 2, chargedFpCost: null, outputUnit: "per-tick", magicMotionValue: 36 },
      { id: "comet-azur", fpCost: 40, sustainedFpCost: 10, chargedFpCost: null, outputUnit: "per-tick", magicMotionValue: 55 },
      { id: "crystal-torrent", fpCost: 20, sustainedFpCost: 5, chargedFpCost: null, outputUnit: "per-tick", magicMotionValue: 57 },
    ]);
  });

  it("resolves verified explosion damage through hit bullets", () => {
    const spells = mapBaseGameSpells([
      { ...row(4080, "[Sorcery] Cannon of Haima"), refCategory1: 1, refId1: 10408000 },
      chargedRow(6100, "[Incantation] Giantsflame Take Thee", 10610000, 10610050),
      { ...row(7090, "[Incantation] Greyoll's Roar"), refCategory1: 1, refId1: 10709000 },
    ], {
      bullets: [
        { ...bullet(10408000, 40800), HitBulletID: 10408001 },
        bullet(10408001, 40801),
        { ...bullet(10610000, 79980), HitBulletID: 10610001 },
        bullet(10610001, 61000),
        { ...bullet(10610050, 79990), HitBulletID: 10610051 },
        bullet(10610051, 61005),
        { ...bullet(10709000, 70900), spEffectId0: 1709000 },
      ],
      attacks: [
        spellAttack(40801, "Cannon of Haima explosion", 285),
        elementalSpellAttack(61000, "Giantsflame Take Thee", "fire", 325),
        elementalSpellAttack(61005, "Giantsflame Take Thee [Charged]", "fire", 389),
        physicalSpellAttack(70900, "Greyoll's Roar", 320),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [statusEffect(1709000, 0)],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id,
      sourceBulletId: attack?.sourceBulletId,
      normal: attack?.motionValues,
      charged: chargedAttack?.motionValues ?? null,
    }))).toEqual([
      { ...hitProfile("cannon-of-haima", "magic", 285), sourceBulletId: 10408001 },
      { ...hitProfile("giantsflame-take-thee", "fire", 325, 389), sourceBulletId: 10610001 },
      { ...hitProfile("greyoll-s-roar", "physical", 320), sourceBulletId: 10709000 },
    ]);
  });

  it("maps grouped spread attacks as per-projectile normal and charged profiles", () => {
    const spells = mapBaseGameSpells([
      chargedRow(4090, "[Sorcery] Crystal Burst", 10409000, 10409001),
      chargedRow(6230, "[Incantation] Scouring Black Flame", 10623000, 10623001),
      chargedRow(6820, "[Incantation] Beast Claw", 10682000, 10682050),
      chargedRow(7310, "[Incantation] The Flame of Frenzy", 10731000, 10731050),
    ], {
      bullets: [
        bullet(10409000, 40900), bullet(10409001, 40900),
        { ...bullet(10623000, 62300), spEffectId0: 1623000 },
        { ...bullet(10623001, 62300), spEffectId0: 1623000 },
        bullet(10682000, 68200), bullet(10682050, 68205),
        { ...bullet(10731000, 73100), spEffectId0: 1731000 },
        { ...bullet(10731050, 73105), spEffectId0: 1731001 },
      ],
      attacks: [
        spellAttack(40900, "Crystal Burst", 40),
        elementalSpellAttack(62300, "Scouring Black Flame", "fire", 255),
        physicalSpellAttack(68200, "Beast Claw", 193),
        physicalSpellAttack(68205, "Beast Claw [Charged]", 222),
        elementalSpellAttack(73100, "The Flame of Frenzy", "fire", 107),
        elementalSpellAttack(73105, "The Flame of Frenzy [Charged]", "fire", 124),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [
        statusEffect(1623000, 0),
        statusEffect(1731000, 0, 21), statusEffect(1731001, 0, 28),
      ],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id,
      normal: attack?.motionValues,
      charged: chargedAttack?.motionValues,
      status: attack?.statusBuildup,
      chargedStatus: chargedAttack?.statusBuildup,
    }))).toEqual([
      spreadProfile("crystal-burst", "magic", 40, 40),
      spreadProfile("scouring-black-flame", "fire", 255, 255),
      spreadProfile("beast-claw", "physical", 193, 222),
      {
        ...spreadProfile("the-flame-of-frenzy", "fire", 107, 124),
        status: { ...emptyStatusBuildup(), madness: 21 },
        chargedStatus: { ...emptyStatusBuildup(), madness: 28 },
      },
    ]);
  });

  it("maps verified impact, explosion, and lingering-area components separately", () => {
    const spells = mapBaseGameSpells([
      chargedRow(4800, "[Sorcery] Magma Shot", 10480000, 10480050),
      chargedRow(4820, "[Sorcery] Roiling Magma", 10482000, 10482050),
      { ...row(5010, "[Sorcery] Explosive Ghostflame"), refCategory1: 1, refId1: 10501000 },
    ], {
      bullets: [
        bullet(10480001, 48000), bullet(10480004, 48003),
        bullet(10480051, 48005), bullet(10480054, 48007),
        bullet(10482000, 48200), bullet(10482004, 48204), bullet(10482007, 48206),
        bullet(10482050, 48210), bullet(10482054, 48214), bullet(10482057, 48216),
        { ...bullet(10501000, 50100), spEffectId0: 1501000 },
        { ...bullet(10501020, 50101), spEffectId0: 1501001 },
      ],
      attacks: [
        elementalSpellAttack(48000, "Magma Shot impact", "fire", 210),
        elementalSpellAttack(48003, "Magma Shot pool", "fire", 48),
        elementalSpellAttack(48005, "Magma Shot charged impact", "fire", 250),
        elementalSpellAttack(48007, "Magma Shot charged pool", "fire", 53),
        elementalSpellAttack(48200, "Roiling Magma projectile", "fire", 234),
        elementalSpellAttack(48204, "Roiling Magma explosion", "fire", 318),
        elementalSpellAttack(48206, "Roiling Magma pool", "fire", 43),
        elementalSpellAttack(48210, "Roiling Magma charged projectile", "fire", 325),
        elementalSpellAttack(48214, "Roiling Magma charged explosion", "fire", 390),
        elementalSpellAttack(48216, "Roiling Magma charged pool", "fire", 48),
        spellAttack(50100, "Explosive Ghostflame blast", 312),
        spellAttack(50101, "Explosive Ghostflame area", 60),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [statusEffect(1501000, 130), statusEffect(1501001, 38)],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id,
      normal: componentSummary(attack!),
      charged: chargedAttack ? componentSummary(chargedAttack) : null,
    }))).toEqual([
      {
        id: "magma-shot",
        normal: [["impact-normal", "per-hit", 210, 0], ["magma-normal", "per-tick", 48, 0]],
        charged: [["impact-charged", "per-hit", 250, 0], ["magma-charged", "per-tick", 53, 0]],
      },
      {
        id: "roiling-magma",
        normal: [["projectile-normal", "per-hit", 234, 0], ["explosion-normal", "per-hit", 318, 0], ["magma-normal", "per-tick", 43, 0]],
        charged: [["projectile-charged", "per-hit", 325, 0], ["explosion-charged", "per-hit", 390, 0], ["magma-charged", "per-tick", 48, 0]],
      },
      {
        id: "explosive-ghostflame",
        normal: [["initial-blast", "per-hit", 0, 130], ["ghostflame", "per-tick", 0, 38]],
        charged: null,
      },
    ]);
  });

  it("deduplicates repeated chains into distinct per-hit component profiles", () => {
    const spells = mapBaseGameSpells([
      chargedRow(4500, "[Sorcery] Shattering Crystal", 10450000, 10450001),
      { ...row(6940, "[Incantation] Ancient Dragons' Light Spear"), refCategory1: 1, refId1: 10694000 },
      { ...row(6941, "[Incantation] Fortissax's Light Spear"), refCategory1: 1, refId1: 10694100 },
    ], {
      bullets: [
        bullet(10450000, 45000), bullet(10450001, 45000),
        bullet(10450003, 45001), bullet(10450004, 45002),
        bullet(10694000, 69400), bullet(10694001, 69402), bullet(10694002, 69401),
        bullet(10694100, 69410), bullet(10694101, 69412), bullet(10694102, 69411),
        bullet(10694150, 69415), bullet(10694151, 69417), bullet(10694152, 69416),
      ],
      attacks: [
        spellAttack(45000, "Shattering Crystal initial", 127),
        spellAttack(45001, "Shattering Crystal burst", 60),
        spellAttack(45002, "Shattering Crystal fragments", 51),
        elementalSpellAttack(69400, "Ancient spear impact", "lightning", 360),
        elementalSpellAttack(69402, "Ancient secondary", "lightning", 285),
        elementalSpellAttack(69401, "Ancient wave", "lightning", 122),
        elementalSpellAttack(69410, "Fortissax first impact", "lightning", 367),
        elementalSpellAttack(69412, "Fortissax first secondary", "lightning", 288),
        elementalSpellAttack(69411, "Fortissax first wave", "lightning", 122),
        elementalSpellAttack(69415, "Fortissax second impact", "lightning", 374),
        elementalSpellAttack(69417, "Fortissax second secondary", "lightning", 292),
        elementalSpellAttack(69416, "Fortissax second wave", "lightning", 123),
      ],
      finalDamageRates: [unitFinalDamageRate()],
      effects: [],
    });

    expect(spells.map(({ id, attack, chargedAttack }) => ({
      id,
      normal: typedComponentSummary(attack!),
      charged: chargedAttack ? typedComponentSummary(chargedAttack) : null,
    }))).toEqual([
      {
        id: "shattering-crystal",
        normal: [["initial-crystals-normal", 127, 0], ["burst-normal", 60, 0], ["fragments-normal", 51, 0]],
        charged: [["initial-crystals-charged", 127, 0], ["burst-charged", 60, 0], ["fragments-charged", 51, 0]],
      },
      {
        id: "ancient-dragons-lightning-spear",
        normal: [["spear-impact", 0, 360], ["secondary-strike", 0, 285], ["lightning-wave", 0, 122]],
        charged: null,
      },
      {
        id: "fortissax-s-lightning-spear",
        normal: [
          ["first-spear-impact", 0, 367], ["first-secondary-strike", 0, 288], ["first-lightning-wave", 0, 122],
          ["second-spear-impact", 0, 374], ["second-secondary-strike", 0, 292], ["second-lightning-wave", 0, 123],
        ],
        charged: null,
      },
    ]);
  });

  it("maps verified aura, body, and weapon buff effects", () => {
    const spells = mapBaseGameSpells([
      row(4460, "[Sorcery] Scholar's Armament"),
      row(4490, "[Sorcery] Frozen Armament"),
      row(6050, "[Incantation] Flame Grant Me Strength"),
      row(6250, "[Incantation] Black Flame Blade"),
      row(6320, "[Incantation] Bloodflame Blade"),
      row(6600, "[Incantation] Golden Vow"),
      row(6770, "[Incantation] Order's Blade"),
      row(6960, "[Incantation] Electrify Armament"),
      row(6970, "[Incantation] Vyke's Dragonbolt"),
      row(7230, "[Incantation] Poison Armament"),
      row(7330, "[Incantation] Howl of Shabriri"),
    ], {
      bullets: [], attacks: [], finalDamageRates: [],
      effects: [
        buffEffect(1446000, 90, {}, { magic: 75 }),
        buffEffect(1449000, 60, {}, {}, 1449001),
        statusEffect(1449001, 63),
        buffEffect(1605000, 30, { physical: 1.2, fire: 1.2 }),
        buffEffect(1626000, 7, {}, { fire: 65 }),
        buffEffect(1632000, 60, {}, { fire: 40 }),
        buffEffect(1660000, 80, {
          physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15,
        }),
        buffEffect(1677000, 90, {}, { holy: 75 }),
        buffEffect(1696000, 90, {}, { lightning: 75 }),
        buffEffect(1697000, 70, {}, { lightning: 75 }),
        buffEffect(1723000, 60, {}, {}, 1723001),
        { ...statusEffect(1723001, 0), poizonAttackPower: 70 },
        buffEffect(1733000, 40, {
          physical: 1.25, magic: 1.25, fire: 1.25, lightning: 1.25, holy: 1.25,
        }),
      ],
    });

    expect(spells.map(({ id, calculationStatus, buffEffect }) => ({
      id, calculationStatus, buffEffect,
    }))).toMatchObject([
      { id: "scholar-s-armament", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 90, weaponAddedDamageScaling: { magic: 0.75 } } },
      { id: "frozen-armament", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 60, weaponAddedStatusBuildup: { frost: 63 } } },
      { id: "flame-grant-me-strength", calculationStatus: "supported", buffEffect: { slot: "body", durationSeconds: 30, outgoingDamageMultipliers: { physical: 1.2, fire: 1.2 } } },
      { id: "black-flame-blade", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 7, weaponAddedDamageScaling: { fire: 0.65 } } },
      { id: "bloodflame-blade", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 60, weaponAddedDamageScaling: { fire: 0.4 } } },
      { id: "golden-vow", calculationStatus: "supported", buffEffect: { slot: "aura", durationSeconds: 80, outgoingDamageMultipliers: { physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15 } } },
      { id: "order-s-blade", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 90, weaponAddedDamageScaling: { holy: 0.75 }, limitations: ["Order's Blade anti-undead behavior is not yet included."] } },
      { id: "electrify-armament", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 90, weaponAddedDamageScaling: { lightning: 0.75 } } },
      { id: "vyke-s-dragonbolt", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 70, weaponAddedDamageScaling: { lightning: 0.75 }, limitations: ["Vyke's Dragonbolt equip-load bonus and increased lightning damage taken are not yet included."] } },
      { id: "poison-armament", calculationStatus: "supported", buffEffect: { slot: "weapon", durationSeconds: 60, weaponAddedStatusBuildup: { poison: 70 } } },
      { id: "howl-of-shabriri", calculationStatus: "supported", buffEffect: { slot: "body", durationSeconds: 40, outgoingDamageMultipliers: { physical: 1.25, magic: 1.25, fire: 1.25, lightning: 1.25, holy: 1.25 }, limitations: ["The increased incoming damage from Howl of Shabriri is not yet included."] } },
    ]);
  });
});

function row(ID: number, Name: string): MagicParamRow {
  return { ID, Name, mp: 7, mp_charge: 0, slotLength: 1, requirementIntellect: 10, requirementFaith: 0, requirementLuck: 0, iconId: 4000, refCategory1: 0, refId1: -1, refCategory2: 0, refId2: -1 };
}

function spellAttack(ID: number, Name: string, atkMag: number) {
  return {
    ID, Name, atkPhysCorrection: 100, atkMagCorrection: 100,
    atkFireCorrection: 100, atkThunCorrection: 100, atkDarkCorrection: 100,
    atkPhys: 0, atkMag, atkFire: 0, atkThun: 0, atkDark: 0,
    atkAttribute: 3, isAddBaseAtk: 0, finalDamageRateId: 20000,
  };
}

function elementalSpellAttack(
  ID: number,
  Name: string,
  type: "fire" | "lightning" | "holy",
  motionValue: number,
) {
  const attack = spellAttack(ID, Name, 0);
  if (type === "fire") attack.atkFire = motionValue;
  if (type === "lightning") attack.atkThun = motionValue;
  if (type === "holy") attack.atkDark = motionValue;
  return attack;
}

function physicalSpellAttack(ID: number, Name: string, motionValue: number) {
  return { ...spellAttack(ID, Name, 0), atkPhys: motionValue };
}

function chargedRow(ID: number, Name: string, refId1: number, refId2: number): MagicParamRow {
  return { ...row(ID, Name), mp_charge: 10, refCategory1: 1, refId1, refCategory2: 1, refId2 };
}

function sustainedRow(
  ID: number,
  Name: string,
  mp: number,
  mp_charge: number,
  refId1: number,
): MagicParamRow {
  return { ...row(ID, Name), mp, mp_charge, refCategory1: 1, refId1 };
}

function bullet(ID: number, atkId_Bullet: number) {
  return { ID, Name: "", atkId_Bullet, intervalCreateBulletId: -1 };
}

function spellProfile(
  id: string,
  type: "fire" | "lightning" | "holy",
  normal: number,
  charged?: number,
) {
  const normalValues = { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
  normalValues[type] = normal;
  const chargedValues = charged === undefined ? null : { ...normalValues, [type]: charged };
  return {
    id,
    normal: normalValues,
    charged: chargedValues,
    status: emptyStatusBuildup(),
    chargedStatus: charged === undefined ? null : emptyStatusBuildup(),
  };
}

function hitProfile(
  id: string,
  type: "physical" | "magic" | "fire",
  normal: number,
  charged?: number,
) {
  const normalValues = { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
  normalValues[type] = normal;
  return {
    id,
    normal: normalValues,
    charged: charged === undefined ? null : { ...normalValues, [type]: charged },
  };
}

function spreadProfile(
  id: string,
  type: "physical" | "magic" | "fire",
  normal: number,
  charged: number,
) {
  const profile = hitProfile(id, type, normal, charged);
  return {
    ...profile,
    status: emptyStatusBuildup(),
    chargedStatus: emptyStatusBuildup(),
  };
}

function componentSummary(profile: NonNullable<SpellData["attack"]>) {
  return [profile, ...profile.additionalComponents].map((component) => [
    component.id,
    component.outputUnit,
    component.motionValues.fire,
    component.statusBuildup.frost,
  ]);
}

function typedComponentSummary(profile: NonNullable<SpellData["attack"]>) {
  return [profile, ...profile.additionalComponents].map((component) => [
    component.id,
    component.motionValues.magic,
    component.motionValues.lightning,
  ]);
}

function unitFinalDamageRate() {
  return {
    ID: 20000, Name: "", physRate: 1, magRate: 1,
    fireRate: 1, thunRate: 1, darkRate: 1,
  };
}

function statusEffect(ID: number, frost: number, madness = 0): ArmorEffectRow {
  return {
    ID, poizonAttackPower: 0, diseaseAttackPower: 0, bloodAttackPower: 0,
    curseAttackPower: 0, freezeAttackPower: frost, sleepAttackPower: 0,
    madnessAttackPower: madness,
  } as ArmorEffectRow;
}

function buffEffect(
  ID: number,
  effectEndurance: number,
  outgoing: Partial<Record<"physical" | "magic" | "fire" | "lightning" | "holy", number>>,
  added: Partial<Record<"physical" | "magic" | "fire" | "lightning" | "holy", number>> = {},
  atkOccurrenceSpEffectId = -1,
) {
  return {
    ...statusEffect(ID, 0), effectEndurance,
    atkEnemyDmgCorrectRate_Physics: outgoing.physical ?? 1,
    atkEnemyDmgCorrectRate_Magic: outgoing.magic ?? 1,
    atkEnemyDmgCorrectRate_Fire: outgoing.fire ?? 1,
    atkEnemyDmgCorrectRate_Thunder: outgoing.lightning ?? 1,
    atkEnemyDmgCorrectRate_Dark: outgoing.holy ?? 1,
    physicsAttackPower: added.physical ?? 0, magicAttackPower: added.magic ?? 0,
    fireAttackPower: added.fire ?? 0, thunderAttackPower: added.lightning ?? 0,
    darkAttackPower: added.holy ?? 0,
    atkOccurrenceSpEffectId,
  };
}

function emptyStatusBuildup() {
  return { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 };
}
