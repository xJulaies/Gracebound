# Damage calculation MVP

`POST /api/damage/calculate` accepts either attack rating directly or a weapon
ID, upgrade level, and character stats. Both request forms accept an optional
`bossId`. At runtime, the weapon and selected boss are read from the normalized
Regulation dataset for the configured game version in MongoDB.
Database integration tests use a small normalized Regulation fixture in a
MongoDB Memory Server; Atlas is never required for automated tests.

Without `bossId`, the endpoint returns boss-independent offensive output and
does not claim final dealt damage. With `bossId`, it applies the stored defense
and absorption values and additionally returns estimated damage. Client-
supplied boss combat values are rejected.

Weapon requests use `attackId`. The backend loads that weapon's imported attack
profile and applies its Regulation-derived per-damage-type motion values and
physical attack type. `motionValue` and `physicalAttackType` remain available
only for the explicit manual attack-rating request form.

Calculation order for each damage type:

```text
attack rating
  -> motion value
  -> target defense
  -> target absorption
  -> floor to whole damage
```

The defense multiplier uses the community-documented, piecewise
attack-to-defense ratio formula. Results are therefore returned with
`accuracy: "estimated"`.

Current limitations:

- the Regulation weapon and boss catalogs must be imported before runtime use
- no buffs or status-effect damage
- no special attack mechanics
- the imported direct-melee slice contains 9,810 profiles for 318 weapons
  across 29 motion categories in Regulation 1.17.0
- jump, critical, mounted, projectile, spell, and special behaviors remain
  excluded until their mappings and calculation rules are separately verified

Target defense is calculated separately for every damage type. Physical damage
also selects `standard`, `slash`, `strike`, or `pierce` absorption. This mirrors
the normalized Regulation boss model and avoids applying one generic resistance
to every component of a split-damage weapon.

Selected normal weapon attacks can be mapped locally through
`BehaviorParam_PC.refId -> AtkParam_Pc.ID`. The normalized attack profile keeps
one motion value per damage type and resolves inherited physical attack
attributes through the weapon row. Projectile behaviors and Ashes of War remain
separate from normal attack profiles.

Selected Ashes of War are represented as multi-component skill attacks. For
example, Transient Moonlight contains a projectile with added magic damage and
a separate weapon hit with weapon-AR motion values. Each component preserves
its own final damage rates. A weapon request selects exactly one normal
`attackId` or one `skillAttackId`; both are resolved only within that weapon.
Complete Ash-of-War coverage is not part of the MVP; unsupported skill mechanics
must still be rejected instead of approximated.

The completed standalone Ash-of-War calculation set contains eleven entries:
Square Off, Flame of the Redmanes, Lion's Claw, Impaling Thrust, Piercing Fang,
Stamp (Upward Cut), Stamp (Sweep), Giant Hunt, Wild Strikes, Charge Forth, and
Unsheathe. Their supported actions and multi-hit sequences are defined in
`SPEC.md`. Every other catalog Ash remains `catalog-only`. Transient Moonlight
is supported separately as Moonveil's fixed weapon skill.

Interchangeable skills add `ashOfWarId` beside `skillAttackId`. The backend
loads the selected weapon's normalized motion type and rejects incompatible
Ash-of-War combinations before calculating their stored components.

Weapon damage requests may include up to four unique `talismanIds`. Permanent
attribute effects are applied before attack-rating calculation and exposed as
`effectiveStats`, while `stats` keeps the submitted values. The initial verified
set is Starscourge Heirloom, Prosthesis-Wearer Heirloom, Stargazer Heirloom, and
Two Fingers Heirloom. Unsupported talismans are rejected instead of ignored.
Radagon's and Marika's Scarseal/Soreseal additionally contribute their relevant
weapon-scaling attributes. Their Vigor, Mind, Endurance, and incoming-damage
penalties are preserved in the talisman catalog but are not consumed by this
outgoing-damage endpoint.

Magic, Lightning, Fire, and Sacred Scorpion Charm multiply only their matching
raw component damage by the Regulation PvE factor `1.12`. This happens before
boss defense and absorption and includes added skill damage. Attack rating is
reported unchanged. Their `1.10` incoming physical-damage multiplier remains in
the catalog for future player-defense calculations.

Warrior Jar Shard (`1.10`) and Shard of Alexander (`1.15`) multiply every
component of Ash-of-War and fixed weapon-skill attacks. Their scoped multiplier
is never applied to normal weapon attacks.

The Axe Talisman (`1.10`) applies only when a verified normal attack profile is
a fully charged heavy attack. It does not modify regular heavy attacks or
skills.

Dragoncrest and the base-game elemental Drakes are supported as permanent PvE
incoming-damage modifiers. Their values are available in the talisman catalog,
but this outgoing-damage endpoint does not consume them.

Amber Medallions, Arsenal Charms, and Erdtree's Favor expose their verified HP,
FP, stamina, and equip-load multipliers in the catalog. This endpoint does not
derive those absolute character resources yet.

Horn Charms, Prince of Death variants, and Mottled Necklaces expose their
verified per-status resistance point bonuses. They are catalog/build-defense
data and do not alter outgoing damage.

Graven and Canvas talismans expose separate sorcery and incantation damage
multipliers for a future spell calculator. They intentionally do not affect the
weapon-damage endpoint.

Permanent discovery, rune, memory-slot, stamina-recovery, poise, and skill-cost
utility effects are retained in the talisman catalog but are outside this
outgoing-damage calculation.

Spell duration, casting speed, spell FP cost, and Primal Glintstone Blade's HP
tradeoff are also cataloged for later build/spell calculations.

Seed flask multipliers and Blessed Dew's HP-per-second regeneration are retained
as recovery data and do not change outgoing damage.

Guard stamina modifiers and Daedicar's incoming-damage penalty are retained for
future guard and player-defense calculations.

Conditional attack multipliers for counterattacks, criticals, combo finishers,
mounted attacks, jumping attacks, and guard counters are cataloged separately.
This endpoint does not apply them without a matching verified attack profile.

Low-HP Branchsword and full-HP Ritual modifiers retain their thresholds and
damage scopes. They remain inactive here until the request contract has
validated current/max HP state.

Projectile range, ranged damage, roar/breath damage, and charged spell/skill
effects are cataloged separately and remain inactive without a verified
compatible profile.

Throwable-pot and perfume damage multipliers are cataloged in separate scopes
and are outside weapon damage calculation.

Successive-hit talismans retain all Regulation thresholds and boost stages;
Millicent's +5 Dexterity remains permanent. Staged damage needs server-owned hit
state and is not inferred by this endpoint.

Blood-loss and poison/rot Exultation boosts retain their trigger, duration, and
multipliers. They remain inactive without a validated status-trigger event.

Kill-, critical-, and successive-hit recovery effects retain their percentage
and flat HP/FP components. They are inactive without server-owned combat events.

Stealth, fall damage, target priority, rune retention, and appearance effects
are catalog utility data and do not alter outgoing damage.

Critical/headshot defense, Crucible Feather's dodge tradeoff, and crouched
concealment are retained as special defensive data outside outgoing damage.
