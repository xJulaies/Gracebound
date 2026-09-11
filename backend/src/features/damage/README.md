# Damage calculation

Gracebound exposes two server-owned damage flows:

```text
POST /api/damage/calculate
POST /api/me/builds/:buildId/calculate-damage
```

The general endpoint accepts either a manual attack-rating request or a
Regulation-backed weapon, skill, Ash-of-War, or spell request. The protected
saved-build endpoint accepts only a stored weapon-slot action or stored spell;
stats, equipment, affinities, upgrades, and effects are derived from the owned
build. Client-supplied target defenses and ownership data are never trusted.

Both flows read the normalized Elden Ring `1.17.0` dataset from MongoDB. They do
not read raw exports during a request. Automated database tests use MongoDB
Memory Server and cannot alter the configured development database.

## Calculation order

For each physical, magic, fire, lightning, and holy component:

```text
base or catalyst attack rating
  -> requirements and scaling
  -> attack motion value and flat component damage
  -> applicable permanent and transient outgoing modifiers
  -> target defense
  -> matching target absorption
  -> floor to whole damage
```

Physical damage additionally selects standard, slash, strike, or pierce
absorption. Without a boss, the response reports offensive output and does not
claim dealt damage. With a boss, the response applies its server-owned phase
profile and reports estimated damage plus the percentage of that phase's HP.
The defense formula is piecewise and community documented, so final results are
explicitly marked `accuracy: "estimated"`.

## Supported actions

Regulation `1.17.0` currently contributes:

- 487 canonical weapons and 3,343 calculation variants
- 11,748 verified direct attack profiles for 336 melee weapons
- 177 base-game boss combat profiles with phase-aware defense and absorption
- 116 Ashes of War: 29 supported and 87 catalog-only
- 171 spells: 45 supported and 126 catalog-only
- 116 talismans: 114 supported and 2 catalog-only
- 7 Great Runes: 3 supported and 4 catalog-only
- 32 Crystal Tears: 22 supported and 10 catalog-only

Normal weapon actions are resolved by canonical weapon and attack ID. The
selected calculation variant must belong to that weapon. Interchangeable Ashes
must also match the selected weapon type and affinity. Fixed weapon skills and
Ashes preserve separate weapon-hit and projectile components, FP cost, motion
values, flat damage, final-damage rates, status buildup, and target-health
effects where verified.

The 22 standalone Ashes with verified damage profiles are Square Off, Flame of
the Redmanes, Lion's Claw, Impaling Thrust, Piercing Fang, Stamp (Upward Cut),
Stamp (Sweep), Giant Hunt, Wild Strikes, Charge Forth, Unsheathe, Prayerful
Strike, Thunderbolt, Black Flame Tornado, Spectral Lance, Storm Stomp, Storm
Blade, Beast's Roar, Vacuum Slice, Ice Spear, Glintstone Pebble, and Blood
Blade. Sacred Blade, Flaming Strike, Lightning Slash, Determination, Royal
Knight's Resolve, Seppuku, and Cragblade provide verified weapon-buff profiles.
Transient Moonlight is supported separately as Moonveil's fixed skill.

Spell profiles cover verified direct, charged, area, spread, multi-projectile,
multi-component, and per-tick actions. Catalyst type, variant, upgrade, and
attribute requirements are validated server-side. Per-projectile and per-tick
results are labeled as such; the calculator does not invent a hit count or
channel duration.

## Effects

Damage requests may apply verified effects from the selected build or explicit
general request:

- up to four unique supported talismans
- supported armor passives
- one supported Great Rune
- up to two unique supported Crystal Tears
- one Aura and one Body buff
- one compatible weapon buff
- a compatible Ash-of-War weapon buff

Attribute modifiers are applied before weapon or catalyst scaling. Scoped
weapon, skill, spell-school, charged-action, damage-type, and outgoing-damage
multipliers are applied only when their verified conditions match. The
saved-build trial may temporarily deactivate stored effects, but it cannot add
an effect that is not part of that build and never persists trial state.

## Explicit limitations

The calculator is deterministic damage-per-action simulation, not a complete
combat engine. It intentionally does not infer:

- DPS, animation timing, stamina use, or complete combos
- whether every projectile, repeated wave, or channel tick connects
- accumulated status state or poison, bleed, frost, sleep, madness, rot, or
  death-blight procs
- PvP-specific modifiers
- enemy AI, distance, headshots, terrain, stealth, or multiplayer state
- conditional effects without validated HP, event, kill, critical, or
  successive-hit state
- behavior for catalog-only spells, Ashes, Great Runes, or Crystal Tears

Known partial mechanics remain visible as response limitations. Examples
include Prayerful Strike healing, Seppuku self-damage, Sacred Blade's
anti-undead behavior, Bloodflame delayed bleed, and unresolved duration totals.
Unsupported selections are rejected rather than silently approximated.
