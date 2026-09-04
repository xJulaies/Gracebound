# Regulation imports

Raw Smithbox CSV exports and `regulation.bin` remain local and must not be
committed. The weapon importer validates and maps the complete catalog before
opening a MongoDB connection.

Export `English -> Item` from Smithbox's Text Editor as JSON to a directory
outside the repository. Import names, summaries, and descriptions into the
existing versioned catalogs with:

```powershell
npm run data:texts:import -- --texts "C:\path\to\item-texts.json" --dry-run
npm run data:texts:import -- --texts "C:\path\to\item-texts.json"
```

The importer merges base and patch-layer FMGs, filters invalid text, and only
updates existing weapon, armor, talisman, spell, Ash of War, Great Rune, and
Crystal Tear records. It never creates catalog entries from text files.

`EquipParamWeapon.csv` must include the `enableMagic` and `enableMiracle`
columns. They identify sorcery staffs and sacred seals without relying on names
or hard-coded weapon lists. Catalyst scaling reuses the imported reinforcement,
AttackElementCorrect, and CalcCorrectGraph data with a Regulation base value of
100. Keep scaling separated by damage type until spell attack components are
mapped and can select the correct component.

The weapon import also reads `BehaviorParam_PC.csv` and `AtkParam_Pc.csv` for
the explicitly verified direct-melee slice. Version 1.17.0 maps 9,810 attack
profiles to 318 weapons across 29 motion categories. Jump, critical, mounted,
projectile, spell, and special behaviors remain excluded until their animation
mappings and calculation rules are separately verified.
Weapon-specific direct behaviors, such as altered heavy attacks, replace the
class fallback when the weapon's `behaviorVariationId` supplies one.

The importer also reads `SwordArtsParam.csv`, `Bullet.csv`, and
`FinalDamageRateParam.csv`. The first persisted skill slice maps both Transient
Moonlight attacks into separate projectile and weapon-hit components.

The generic mapper is additionally verified against pure weapon-hit, pure
projectile, mixed, and weapon-class-dependent definitions. Thirteen standalone
Ashes currently have verified damage profiles: Square Off, Flame of the
Redmanes, Lion's Claw, Impaling Thrust, Piercing Fang, Stamp (Upward Cut), Stamp
(Sweep), Giant Hunt, Wild Strikes, Charge Forth, Unsheathe, Prayerful Strike,
and Thunderbolt. Wild Strikes
keeps separate Regulation-derived skill profiles for all nine compatible weapon
types. Prayerful Strike retains class-specific physical attack types; its
healing effect remains outside the stateless damage calculation. Thunderbolt is
a verified pure projectile with 120 added lightning damage and a 10 FP cost.

Regulation 1.17.0 contributes 116 playable Ash-of-War rows. Every entry exposes
weapon-type and affinity compatibility. Unverified entries are imported as
`catalog-only` with no damage or buff profile; only `supported` entries may be
used by the damage endpoint. Twenty are supported: thirteen damage profiles and
seven verified weapon-buff profiles. Buff values come from their named
`SpEffectParam` rows, including duration, next-hit consumption, attack-power and
outgoing multipliers, flat added damage, status buildup, and poise damage.

The base-game talisman import reads `EquipParamAccessory.csv`, validates the
116 named Regulation 1.17.0 rows below accessory ID 7000, and stores a normalized
`talismans` catalog. DLC rows remain excluded until a complete DLC export exists.
Run it with:

```powershell
npm run data:import:talismans -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Raw accessory and effect IDs remain internal. Effect calculations are added in
separate verified slices.

Import the ten starting classes and the resource, defense, and status-resistance curves
from `BaseChrSelectMenuParam.csv`, `CharaInitParam.csv`, and
`CalcCorrectGraph.csv` with:

```powershell
npm run data:import:classes -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Append `--dry-run` to validate the complete input without changing MongoDB.

Import the normalized base-game armor catalog from `EquipParamProtector.csv`
and its resident passive effects from `SpEffectParam.csv`. The importer also
uses `BehaviorParam_PC.csv` and `Bullet.csv` to resolve effects such as Deathbed
Dress ally regeneration:

```powershell
npm run data:import:armor -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Regulation 1.17.0 must produce exactly 586 obtainable base-game armor pieces.
The unavailable cut-content `Grass Hair Ornament` is excluded explicitly.

Import the normalized spell catalog from `Magic.csv`:

```powershell
npm run data:import:spells -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Regulation 1.17.0 must produce exactly 70 sorceries and 101 incantations.
The spell importer also reads `Bullet.csv`, `AtkParam_Pc.csv`, and
`FinalDamageRateParam.csv`. Glintstone Pebble, Great Glintstone Shard, Swift
Glintstone Shard, Flame Sling, Wrath of Gold, Discus of Light, Lightning Spear,
and Frenzied Burst are verified direct hit profiles. Glintstone Cometshard,
Comet, Flame Sling, Wrath of Gold, and Frenzied Burst preserve distinct normal
and charged profiles; unverified spells remain catalog-only.

Import the seven base-game Great Runes from `EquipParamGoods.csv` and their
Rune Arc effects from `SpEffectParam.csv` with:

```powershell
npm run data:import:great-runes -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Godrick's, Radahn's, and Morgott's Great Runes expose verified stat or resource
modifiers. Rykard's, Mohg's, and Malenia's remain catalog-only because their
effects require combat or multiplayer state. The Great Rune of the Unborn is
cataloged but has no Rune Arc combat effect. Append `--dry-run` to validate
without changing MongoDB.

Import the 32 base-game Crystal Tears with:

```powershell
npm run data:import:crystal-tears -- --exports "C:\path\to\exports" --regulation "C:\path\to\regulation.bin"
```

Twenty-two Tears currently expose directly verified effects: Crimsonspill,
Greenspill, the four attribute-knot Tears, and the four elemental Shrouding
Tears, plus Spiked, Stonebarb, Opaline Hardtear, and Cerulean Hidden Tear. The
supported utility set also includes Greenburst, Winged, and Speckled Hardtear.
Immediate Crimson and Cerulean recovery plus Crimsonburst regeneration are
also normalized. The remaining entries stay catalog-only until their combat
rules are verified separately.

Glintblade Phalanx, Carian Phalanx, Greatblade Phalanx, Collapsing Stars,
Bestial Sling, and Pest Threads are mapped as per-projectile hit profiles. The
import does not infer a total hit count.

Crystal Barrage, Comet Azur, and Crystal Torrent are mapped as `per-tick`
profiles. Their `Magic.mp_charge` values are stored as ongoing FP costs rather
than charged-cast costs. Total duration and total damage remain combat-state
concerns and are not inferred during import.

Cannon of Haima and Giantsflame Take Thee resolve their verified explosion
attacks through `Bullet.HitBulletID`. Greyoll's Roar uses its direct area attack.
Do not generalize hit-bullet traversal to unverified multi-component spells.

Crystal Burst, Scouring Black Flame, Beast Claw, and The Flame of Frenzy use
verified normal/charged per-projectile profiles. Their emitted projectile count
is not treated as a guaranteed hit count.

Magma Shot, Roiling Magma, and Explosive Ghostflame use multi-component attack
profiles. Each impact, explosion, or lingering-area tick retains its own Bullet,
attack, output unit, and status buildup. Their aggregate is explicitly limited
to one occurrence per component and is not a total-duration estimate.

Shattering Crystal and both Ancient Dragon lightning spear spells normalize
long repeated Bullet chains into distinct per-hit profiles. Repeated copies of
the same attack row are not counted as guaranteed hits. Magic IDs 6940/6941 use
player-facing `Lightning Spear` name overrides for Smithbox's internal `Light
Spear` labels.

The spell importer also normalizes eleven offensive buffs. Golden Vow, Flame
Grant Me Strength, and Howl of Shabriri provide verified aura/body multipliers.
Eight weapon buffs preserve catalyst-scaling coefficients, flat per-hit status
buildup, and limitations. Weapon
damage applies them only with a verified catalyst and
`EquipParamWeapon.isEnhance` eligibility. Partial secondary mechanics such as
anti-undead behavior, equip-load changes, and incoming-damage penalties remain
explicit limitations.

The importer reads Bullet-linked `SpEffectParam` rows for normalized per-hit
status buildup. Glintstone Icecrag exposes 100 frost buildup; Gravity Well's
pull effect remains non-damaging utility metadata. Frenzied Burst exposes
90/105 madness buildup for its normal/charged profiles.

Compare two local export versions before importing an update:

```powershell
npm run data:compare:regulation -- --before "C:\path\to\1.16.1" --after "C:\path\to\1.17.0"
```

Run from `backend`:

```powershell
$env:SUPPORTED_GAME_VERSION = "1.17.0"
npm run data:import:regulation -- --exports "C:\path\to\exports\raw" --regulation "C:\path\to\regulation.bin"
```

The import transaction replaces only the selected game version in:

- `weapons`
- `weaponVariants`
- `reinforcementData`
- `scalingCurves`

All records store the game version, SHA-256 hash of `regulation.bin`, import
timestamp, and `REGULATION` source marker. A failed write rolls back every
collection.

Import the verified base-game boss catalog from `NpcParam.csv` and
`SpEffectParam.csv` with:

```powershell
$env:SUPPORTED_GAME_VERSION = "1.17.0"
npm run data:import:bosses -- --exports "C:\path\to\exports\raw" --regulation "C:\path\to\regulation.bin"
```

For game version 1.17.0, the boss import validates and maps exactly 177 combat
profiles before it connects to MongoDB. The catalog was derived by resolving
boss health-bar events through map entities to `NpcParam` rows and English game
text. Its transaction replaces only the selected game version in the `bosses`
collection. DLC bosses remain excluded until their local map files are
available and verified.

Append `--dry-run` to either import command to validate and map the complete
dataset without connecting to or changing MongoDB.

Version-specific verified weapon counts protect the database from incomplete
imports. Regulation 1.17.0 contains 468 player-facing weapons and 3,192
calculation variants. Eight names missing from the Param row-name data are
resolved from the matching English `WeaponName.fmg`. Two additional unnamed
rows have no player-facing text entry and are excluded as internal data. The
1.17 weapon and boss datasets are fully validated and ready to import.
