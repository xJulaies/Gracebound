# Local icon extraction

Game icons are local source artifacts and must not be committed. Gracebound
extracts only icon IDs referenced by the active MongoDB catalogs.

Source flow:

```text
UXM menu/hi archives
  -> WitchyBND DDS atlases and layout files
  -> layout-driven crops
  -> WebP quality 90
  -> SHA-256 asset deduplication
  -> manifest.json
```

Export the active IDs:

```powershell
npm run data:icons:export-ids -- --output "C:\Smithbox\game-data\icons-1.17\gracebound-icon-ids.json"
```

Extract the optimized assets:

```powershell
npm run data:icons:extract -- --ids "C:\Smithbox\game-data\icons-1.17\gracebound-icon-ids.json" --raw "C:\Smithbox\game-data\icons-1.17\raw" --output "C:\Smithbox\game-data\icons-1.17\optimized-common" --texconv "C:\Smithbox\tools\DirectXTex-may2026\texconv.exe"
```

`EquipParamGoods.iconId`, joined to `Magic` by row ID, is the stable image ID
for spells. `Magic.iconId` refers to the spell spreadsheet and must not be used
as the public item-asset ID.

Validate without writing to MongoDB:

```powershell
npm run data:icons:import -- --manifest "C:\Smithbox\game-data\icons-1.17\optimized-common\manifest.json" --dry-run
```

Remove `--dry-run` to replace the active version's deduplicated icon assets
transactionally. The importer rejects incomplete manifests, modified files,
duplicate ID mappings, and datasets above 150 MiB.

Audit the stored assets against every icon ID referenced by the active weapon,
armor, talisman, spell, and Ash of War catalogs:

```powershell
npm run data:icons:audit
```

The audit fails for missing assets and reports icon IDs that are stored but no
longer referenced by an active catalog.
