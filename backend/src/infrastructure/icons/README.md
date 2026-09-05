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

## Equipment-editor UI assets

Named menu frames and category symbols use a separate manifest because their
stable string IDs are not item `iconId` values. Extract the approved set from
the same local layout and DDS directories with:

```powershell
npm run data:ui-assets:extract -- --raw "C:\Smithbox\game-data\icons-1.17\raw" --output "C:\Smithbox\game-data\ui-assets-1.17\optimized" --texconv "C:\Smithbox\tools\DirectXTex-may2026\texconv.exe"
```

The extractor resolves every crop from its `.layout` entry and currently emits
15 WebP assets for slot frames, hand and talisman placeholders, equipment and
Ash-of-War frames, and equipment, weapon, armor, magic, sorcery, incantation,
Crystal Tear, and Ash-of-War categories. Keep the generated manifest and image
files outside Git.

Validate the manifest without writing, then import the complete versioned set:

```powershell
npm run data:ui-assets:import -- --manifest "C:\Smithbox\game-data\ui-assets-1.17\optimized\manifest.json" --dry-run
npm run data:ui-assets:import -- --manifest "C:\Smithbox\game-data\ui-assets-1.17\optimized\manifest.json"
```

The public endpoint is `GET /api/assets/ui/:assetId`. It accepts only IDs from
the maintained allowlist and returns the active game's WebP bytes with cache
validation metadata.
