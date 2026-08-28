# Regulation imports

Raw Smithbox CSV exports and `regulation.bin` remain local and must not be
committed. The weapon importer validates and maps the complete catalog before
opening a MongoDB connection.

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

Import the ten MVP bosses from `NpcParam.csv` and `SpEffectParam.csv` with:

```powershell
$env:SUPPORTED_GAME_VERSION = "1.17.0"
npm run data:import:bosses -- --exports "C:\path\to\exports\raw" --regulation "C:\path\to\regulation.bin"
```

The boss import validates and maps all ten configured encounters before it
connects to MongoDB. Its transaction replaces only the selected game version
in the `bosses` collection.

Append `--dry-run` to either import command to validate and map the complete
dataset without connecting to or changing MongoDB.

Version-specific verified weapon counts protect the database from incomplete
imports. Regulation 1.17.0 contains 468 player-facing weapons and 3,192
calculation variants. Eight names missing from the Param row-name data are
resolved from the matching English `WeaponName.fmg`. Two additional unnamed
rows have no player-facing text entry and are excluded as internal data. The
1.17 weapon and boss datasets are fully validated and ready to import.
