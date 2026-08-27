# Regulation imports

Raw Smithbox CSV exports and `regulation.bin` remain local and must not be
committed. The weapon importer validates and maps the complete catalog before
opening a MongoDB connection.

Run from `backend`:

```powershell
$env:SUPPORTED_GAME_VERSION = "1.16.1"
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
