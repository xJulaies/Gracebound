# Regulation imports

Raw Smithbox CSV exports and `regulation.bin` remain local and must not be
committed. The weapon importer validates and maps the complete catalog before
opening a MongoDB connection.

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

The generic mapper is additionally verified against pure weapon-hit (Square
Off) and pure projectile (Flame of the Redmanes) definitions. These become
standalone MongoDB catalog entries using the playable `EquipParamGem` rows and
their weapon compatibility flags.

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
