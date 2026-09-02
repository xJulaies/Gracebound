# Elden Ring Companion — Backend Specification

Version: 0.5

---

# Purpose

The backend provides the REST API and domain logic for the Elden Ring Companion application.

Primary responsibilities:

- expose normalized Elden Ring game data
- manage user-owned builds
- integrate Clerk authentication
- enforce authorization and ownership
- import and normalize regulation-derived game data
- calculate attack rating
- calculate boss-independent offensive output
- calculate estimated damage against a selected boss
- persist application data in MongoDB

---

# Project Structure

The project lives inside a single Git repository with two independent npm projects.

```text
elden-ring-companion/
  frontend/
  backend/
```

The backend has its own:
- `package.json`
- `package-lock.json`
- dependencies
- `agents.md`
- `spec.md`

No npm workspaces, Nx, or Turborepo are required.

---

# Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- Clerk
- REST
- ERDB
- Vitest
- Supertest
- npm

---

# Core Responsibilities

The backend owns:

1. REST API
2. authentication integration
3. authorization
4. user-owned build persistence
5. game-data abstraction
6. regulation-derived game-data import
7. domain models
8. damage-calculation logic

The frontend must never be treated as a security boundary.

---

# Product Contract

The application is a build planner and damage calculator. A user can compose a
build from character level and attributes, weapons and upgrade levels, Ashes of
War, talismans, armor, and other supported equipment.

The backend provides two distinct calculation results:

1. **Boss-independent offensive output**
   - attack rating per damage type and total attack rating
   - attack output after motion values where an attack is selected
   - separate components for multi-hit or projectile skills
   - no target defense or absorption is applied
   - this result must not be presented as exact dealt damage
2. **Boss-specific estimated damage**
   - starts from the same normalized build and selected attack
   - applies the selected boss's defense per damage type
   - applies the matching physical attack type and elemental absorption
   - returns each damage component and the combined estimated damage

Both calculations use backend domain logic. The frontend visualizes the results
but does not reproduce or replace the formulas.

---

# Architecture

Primary backend architecture:

```text
src/
  features/
    builds/
    weapons/
    armor/
    talismans/
    bosses/
    damage/

  infrastructure/
    database/
    auth/
    erdb/

  shared/
    errors/
    middleware/
    validation/
    utils/

  app.ts
  server.ts
```

Features may contain:

```text
routes/
controllers/
services/
repositories/
schemas/
models/
types/
domain/
```

Only introduce layers where they improve clarity or testability.

---

# Game Data Source

Validated exports from the locally installed Elden Ring `regulation.bin` are
the primary source of technical item, attack, NPC, boss, and calculation data.

No secondary fan API should be used as part of the normal application architecture unless the project specification is deliberately changed.

ERDB remains a comparison and fallback source while regulation-derived weapon
coverage is being verified.

The frontend never communicates directly with ERDB.

Boss combat values are derived from validated `NpcParam` and `SpEffectParam`
exports. Weapon attacks and selected Ashes of War additionally use the relevant
weapon, behavior, attack, bullet, skill, and final-damage parameter tables.

Fextralife must not be scraped or used as an automated project data source.

---

# Game Data Strategy

Preferred pipeline:

```text
Local regulation exports
  -> Import
  -> Validation
  -> Transformation
  -> Application domain models
  -> Application game-data storage
  -> REST API
```

The backend must not expose Smithbox or ERDB response structures directly.

The application remains independent from source-specific schema details through
validated mapping into its own domain models.

---

# Game Data Import

A dedicated import process transforms source game data into application-specific models.

Requirements:

- repeatable import
- explicit validation
- explicit mapping
- stable application identifiers where possible
- documented supported game version
- no access to regulation files or ERDB during normal application requests

Game data is treated as read-only during normal application usage.

The implemented weapon import uses the official local ERDB API container:

```text
ghcr.io/eldenringdatabase/erdb-api:0.4.0
```

For the configured game version, the backend loads and validates:

```text
armaments
reinforcements
correction-attack
correction-graph
```

The raw responses are validated with Zod, mapped to the Gracebound weapon
domain, and persisted only after successful validation and mapping. The normal
application does not call ERDB during user requests.

---

# Game Data Collections

Potential collections:

```text
weapons
armor
talismans
bosses
scalingCurves
reinforcementData
attackData
```

Exact collection structure depends on the finalized ERDB mapping.

Game data and user-owned application data should remain logically separated.

---

# Weapons

The backend should expose normalized weapon information required by:

- Compendium
- Build Planner
- Damage Calculator

Potential fields:

- id
- name
- category
- weight
- attribute requirements
- attribute scaling
- physical attack
- magic attack
- fire attack
- lightning attack
- holy attack
- reinforcement information
- ERDB mapping identifiers where internally required

The active application game version is `1.17.0`. Its Regulation export
normalizes 468 player armaments and 3,192 calculation variants. Eight new
English weapon names are resolved from the
matching local `WeaponName.fmg`; two additional unnamed Param rows have no
player-facing text entry and remain excluded as internal data. Affinity
variants are grouped under their canonical weapon. The import validates every
mapped variant by calculating its maximum-level attack rating with valid
attributes before the dataset is eligible for persistence.

Implemented public weapon endpoints:

```text
GET /api/weapons
GET /api/weapons/:weaponId
```

The list supports `page`, `limit`, `search`, and `affinity`. It returns at most
100 records per request and exposes the matching record count through the
`X-Total-Count` response header. Both endpoints return normalized application
data and omit internal MongoDB and import metadata.

---

# Armor

The backend should expose armor information required by the Compendium and Build Planner.

Potential fields:

- id
- name
- category
- weight
- defensive values

Exact fields depend on available ERDB-derived data.

---

# Talismans

The backend should expose:

- id
- name
- icon ID
- weight
- calculation status

The Regulation 1.17.0 MVP catalog imports 116 named base-game rows below accessory
ID 7000 from `EquipParamAccessory`. DLC talismans require a separate complete
Shadow of the Erdtree import. Internal accessory and `SpEffectParam` references remain
server-owned. Public responses do not expose raw Regulation IDs. Routes are:

```text
GET /api/talismans
GET /api/talismans/:talismanId
POST /api/builds/calculate-stats

GET /api/character-classes
```

List routes return arrays; detail routes return a one-element array or an empty
array on errors. Until an effect is explicitly mapped and tested, its
calculation status remains `catalog-only`.

The first supported effect group contains permanent, unconditional attribute
bonuses. Starscourge Heirloom, Prosthesis-Wearer Heirloom, Stargazer Heirloom,
and Two Fingers Heirloom add their Regulation-derived +5 bonus before weapon
attack rating is calculated. Damage requests may include up to four unique
`talismanIds`; unknown and unsupported selections are rejected. Effective
attributes are capped at 99 and returned separately from the submitted base
attributes.

Radagon's Scarseal, Radagon's Soreseal, Marika's Scarseal, and Marika's
Soreseal extend the same permanent group. Their complete catalog effects retain
all eight attribute bonuses and their Regulation-derived incoming-damage
multipliers. The outgoing weapon calculator applies the five weapon-scaling
attributes; Vigor, Mind, Endurance, and incoming damage remain available as
normalized effect metadata for later player-defense calculations.

Magic, Lightning, Fire, and Sacred Scorpion Charm form the first permanent
damage-multiplier group. Their Regulation PvE values apply +12% only to the
matching outgoing damage type and retain the +10% incoming physical-damage
penalty. Multipliers affect the final raw component output, including skill
added damage, before target defense and absorption are evaluated. They do not
alter the displayed weapon attack rating.

Warrior Jar Shard and Shard of Alexander form the verified `skill-only`
multiplier group. Their +10% and +15% Regulation multipliers apply to every
damage component of interchangeable Ashes of War and fixed weapon skills. They
must not affect normal weapon attacks.

The Axe Talisman is the verified `charged-attack` scope. Its +10% Regulation
multiplier applies to every damage type of fully charged normal heavy attacks.
It does not affect uncharged heavy attacks or weapon skills.

The four Dragoncrest variants and all base-game Spell-, Flame-, Bolt-, Halig-,
and Pearldrake variants expose their verified PvE incoming-damage multipliers.
These permanent effects are sourced from `defEnemyDmgCorrectRate_*` and retained
for build defense calculations; they do not change outgoing boss damage.

The three base-game tiers of Crimson, Cerulean, and Viridian Amber Medallions,
Arsenal Charm including Great-Jar's Arsenal, and Erdtree's Favor expose their
permanent maximum HP, FP, stamina, and equip-load multipliers. Absolute resource
values remain a later build-stat calculation concern.

Stalwart, Immunizing, and Clarifying Horn Charms, both Prince of Death variants,
and both Mottled Necklaces expose their permanent Regulation point bonuses for
poison, rot, bleed, frost, sleep, madness, and death blight separately.

Graven-School and Graven-Mass expose sorcery-only damage multipliers. Faithful's
Canvas and Flock's Canvas expose incantation-only damage multipliers. These
scopes are retained for the later spell calculator and do not modify weapon or
Ash-of-War damage.

Silver and Gold Scarabs, Moon of Nokstella, Green Turtle Talisman, Bull-Goat's
Talisman, and Carian Filigreed Crest expose their permanent utility values for
discovery, rune acquisition, memory slots, stamina recovery, poise damage, and
skill FP cost. Values with different units remain separate.

Old Lord's Talisman exposes its spell-duration multiplier, Radagon Icon its
virtual casting Dexterity, and Primal Glintstone Blade its spell FP-cost
multiplier together with its maximum-HP penalty.

Crimson Seed and Cerulean Seed expose their HP- and FP-flask recovery
multipliers. Blessed Dew exposes its verified positive HP recovery per second,
derived from Regulation's signed periodic HP change and interval.

Hammer Talisman exposes its guard stamina-damage multiplier, Greatshield
Talisman its guard stamina-cost multiplier, and Daedicar's Woe its permanent
incoming-damage multiplier across all five damage types.

Spear, Dagger, Twinblade, Lance, Claw, and Curved Sword Talismans expose separate
counterattack, critical, final-chain, mounted, jumping, and guard-counter damage
scopes. The catalog retains these values now; damage calculation consumes a
scope only after the selected server-owned attack profile verifies it.

Red- and Blue-Feathered Branchsword store their 20%-HP activation threshold and
outgoing/incoming multipliers. Ritual Sword and Ritual Shield store their 100%-HP
threshold and corresponding multipliers. Activation requires validated current
and maximum HP and is not inferred by the existing weapon-damage endpoint.

Arrow's Reach stores its projectile-range bonus, Arrow's Sting its ranged-damage
multipliers, Roar Medallion its roar/breath multipliers, and Godfrey Icon its
charged-spell/skill multipliers. These scopes require compatible server-owned
profiles before calculation.

Companion Jar exposes throwable-pot damage multipliers and Perfumer's Talisman
exposes perfume damage multipliers. Both scopes remain isolated for the later
consumable calculator.

Winged Sword Insignia, Rotten Winged Sword Insignia, and Millicent's Prosthesis
expose each successive-hit accumulator threshold, stage duration, and five-type
damage multiplier. Millicent's permanent +5 Dexterity is included independently
of its staged boost. Runtime activation awaits validated successive-hit state.

Lord of Blood's Exultation stores its nearby blood-loss trigger and Kindred of
Rot's Exultation its nearby poison-or-rot trigger. Both resolve their linked
Regulation effect to a 20-second, five-type damage boost. Activation awaits a
validated server-owned status event.

Taker's Cameo, Godskin Swaddling Cloth, both Assassin's Daggers, and Ancestral
Spirit's Horn expose enemy-kill, critical-hit, or successive-attack recovery.
Percentage HP, flat HP, flat FP, and accumulator thresholds remain separate.

Crepus's Vial, Longtail Cat Talisman, Shabriri's Woe, Sacrificial Twig, and both
Trick-Mirrors expose their silence, fall-damage, enemy-priority, rune-retention,
and multiplayer appearance effects as typed miscellaneous data.

Crucible Scale exposes critical-damage reduction. Crucible Feather exposes its
`1.3` incoming-damage penalty and linked dodge-effect refresh/duration. Crucible
Knot exposes headshot-impact reduction, and Concealing Veil exposes conditional
crouched-at-distance concealment.

`GET /api/character-classes` returns the ten Regulation-derived starting
classes with their starting level and all eight starting attributes.

`POST /api/builds/calculate-stats` accepts a character-class ID, all eight base
attributes, and up to four unique supported talisman IDs. Character level is
the selected class's starting level plus all attribute points invested above
its starting values. Attributes below a class starting value are invalid. The
endpoint returns unchanged submitted stats, effective attributes capped at 99,
combined resource multipliers, summed status resistance points, multiplied
incoming-damage modifiers, Regulation-derived base and modified HP/FP/stamina/
equip-load values, selected class/level, and selected talisman metadata.
Unknown classes and unknown or `catalog-only` talismans return `400`.

Resource curves come from `CalcCorrectGraph` IDs 100, 101, 104, and 220 for the
active game version. Attribute bonuses are applied before resolving a curve;
percentage resource modifiers are applied afterwards. The API never reads CSV
exports at request time.

Flat defense uses `CalcCorrectGraph` 102 for the level component and rows 130,
132, 133, and 135 for physical, magic, fire, and holy attribute components;
lightning has no attribute component. Status resistance uses rows 110-116 for
the level components and 120-126 for the matching attribute components. Level
curves are evaluated at `characterLevel + 79`. Preserve fractional components
until they are combined, floor the result, and only then add flat equipment or
talisman resistance points.

Item Discovery uses `CalcCorrectGraph` 140 at effective Arcane. Convert its
factor to displayed points by multiplying by 100 and flooring, then add flat
equipment bonuses such as Silver Scarab's 75 points.

Talisman modifiers are not required to affect the initial damage-calculation MVP.

---

# Bosses

The backend should expose boss information required by:

- Compendium
- Damage Calculator

Potential fields:

- id
- name
- location
- health
- defense
- physical absorption
- magic absorption
- fire absorption
- lightning absorption
- holy absorption
- encounter or phase identifier
- supported game version
- source URL
- accuracy classification where required

The Regulation 1.17.0 import contains 177 verified base-game boss combat
profiles. Names and `NpcParam` mappings were cross-checked through local game
events, map entities, and English game text. Identical repeated encounters are
deduplicated, while different regional combat rows and named phases remain
separate records. Shadow of the Erdtree bosses are excluded because the
required DLC map files are not installed locally; no DLC mappings are guessed.

Implemented public boss endpoints:

```text
GET /api/bosses
GET /api/bosses/:bossId
```

They return only records for the configured game version and omit internal
MongoDB and Regulation source metadata.

Boss raw data follows the same source boundary:

```text
versioned local Regulation, event, map, and text sources
  -> Zod validation
  -> mapping
  -> normalized boss storage
  -> REST API
```

---

# Authentication

Authentication is handled with Clerk.

Protected routes must verify authentication server-side.

The authenticated identity comes from Clerk.

The backend must never trust client-supplied ownership information.

---

# Authorization and Ownership

Authentication answers:

```text
Who is the user?
```

Authorization answers:

```text
May this user perform this action?
```

Ownership answers:

```text
Does this specific resource belong to this user?
```

All user-owned resources must enforce ownership server-side.

The frontend hiding an edit or delete button is not sufficient.

---

# Builds

Build data is application-owned and stored in MongoDB.

Example conceptual model:

```text
Build

id
ownerId
name
description
level
stats
equipment
visibility
createdAt
updatedAt
```

The owner ID is assigned by the backend from the authenticated Clerk user.

The backend must not accept an authoritative owner ID from the request body.

---

# Character Stats

Build character stats include:

- vigor
- mind
- endurance
- strength
- dexterity
- intelligence
- faith
- arcane

Values must be validated with Zod.

The selected starting class is required to derive the character level. Class
data comes from `BaseChrSelectMenuParam` joined to `CharaInitParam`; it is not a
client-authored rules table.

---

# Equipment

Initial build equipment includes:

- primary weapon
- weapon upgrade level
- selected Ash of War where the weapon supports one
- armor
- talismans

Additional slots may be introduced if required.

Selecting equipment and applying its calculation effects are separate concerns.
A talisman or armor item may be stored in a build before every special effect is
supported by the calculator. Unsupported effects must be identified explicitly
and must not be silently approximated.

Equipment references should use stable application game-data identifiers.

## Spell catalog

`GET /api/spells` and `GET /api/spells/:spellId` expose 171 playable
Regulation-derived base-game spells: 70 sorceries and 101 incantations. The
list route may filter by `type=sorcery` or `type=incantation`. Entries include
base FP cost, memory-slot cost, Intelligence/Faith/Arcane requirements, icon,
and an explicit `supported` or `catalog-only` calculation status. NPC rows, unused Carian Retaliation
variants, duplicate Briars casting rows, and DLC IDs are excluded. Death
Lightning and Night Maiden's Mist use their actual player-facing spell types
rather than their mismatched internal casting prefixes.

Spell selection is deliberately separate from spell-damage calculation.
Charged FP behavior, catalyst scaling, projectiles, attack components, buffs,
and healing values require additional verified Regulation mappings and must not
be inferred by the catalog importer.

The build-stats endpoint accepts up to ten unique spell IDs and validates them
against the active Regulation version. `memoryStoneCount` accepts zero through
eight. Available slots are two base slots plus Memory Stones and supported
talisman bonuses. The response exposes available, used, and remaining slots;
over-capacity selections are rejected. FP consumption and spell damage are not
calculated by this build-stats endpoint; verified spell profiles are calculated
through `POST /api/damage/calculate`. Intelligence, Faith, and Arcane requirements
are validated against effective stats after supported armor and talisman
bonuses. Spell entries without a verified combat profile remain `catalog-only`.

Weapon catalog entries expose Regulation-derived `castingTypes` for sorcery
staffs and sacred seals. Catalyst scaling is calculated from the existing
weapon variant, reinforcement, AttackElementCorrect, and CalcCorrectGraph data
using a base value of 100. Values remain separated by damage type until spell
attack components are mapped; the backend must not guess which value a spell
uses.

`POST /api/builds/calculate-stats` accepts an optional `catalyst` with
`weaponId`, `variantId`, and `upgradeLevel`. The backend verifies that the
variant belongs to the catalog weapon, that its casting types cover every
selected spell, that the upgrade exists, and that effective attributes meet
the catalyst requirements. The response exposes five Regulation-derived
scaling values. Verified spell profiles can additionally be calculated through
the damage endpoint.

`POST /api/damage/calculate` supports the verified Glintstone Pebble direct
projectile using its `Magic 4000 -> Bullet 10400000 -> AtkParam_Pc 40000`
references. Its magic motion value is 152 and its final damage rate is 1.0.
The endpoint combines this profile with the selected catalyst's Regulation
scaling and optionally applies the existing boss defense and absorption rules.
Great Glintstone Shard and Swift Glintstone Shard use the same verified direct
projectile path with magic motion values 211 and 114. Glintstone Cometshard and
Comet additionally provide normal/charged magic motion values 259/324 and
292/365. Damage requests select the charged profile with `charged: true`.

Glintstone Icecrag adds a direct magic motion value of 199 and 100 frost buildup
per hit from Bullet-linked `SpEffectParam 1440000`. Gravity Well adds a direct
magic motion value of 148; its pull `SpEffectParam 470` is utility behavior and
does not add damage or status. Status buildup is returned separately and does
not imply a proc.

The grouped direct-incantation mapping additionally supports Flame Sling
(202/255 fire), Wrath of Gold (350/420 holy), Discus of Light (150 holy),
Lightning Spear (234 lightning), and Frenzied Burst (250/309 fire). The paired
values are normal/charged motion values. Frenzied Burst separately exposes
90/105 madness buildup. Lightning Spear remains normal-only until its indirect
charged attack chain is resolved.

Verified multi-projectile profiles return damage per connecting projectile:
Glintblade Phalanx (60 magic), Carian Phalanx (48 magic), Greatblade Phalanx
(100 magic), Collapsing Stars (44 magic), Bestial Sling (87 physical), and Pest
Threads (60 physical). Collapsing Stars exposes the same 44 motion value for
normal and charged projectiles; no total-cast damage is inferred.

Channeled profiles expose `outputUnit: per-tick`: Crystal Barrage has 36 magic,
Comet Azur 55 magic, and Crystal Torrent 57 magic per verified damage tick.
Their initial/ongoing FP costs are 14/2, 40/10, and 20/5 respectively. Ongoing
FP cost is distinct from charged FP cost. The API does not infer channel
duration, total ticks, total damage, or total FP consumption.

Verified area profiles include Cannon of Haima (285 magic), Giantsflame Take
Thee (325/389 fire normal/charged), and Greyoll's Roar (320 physical). Cannon
and Giantsflame resolve damage through the root Bullet's `HitBulletID`; their
non-damaging delivery attacks are not exposed as damage.

Verified spread profiles return per-projectile values: Crystal Burst (40/40
magic), Scouring Black Flame (255/255 fire), Beast Claw (193/222 physical), and
The Flame of Frenzy (107/124 fire plus 21/28 madness). Values are
normal/charged. Projectile counts are not multiplied into the result.

Multi-component profiles expose each phase independently. Magma Shot has
normal/charged impact values 210/250 fire and magma ticks 48/53 fire. Roiling
Magma has projectile 234/325, explosion 318/390, and magma tick 43/48 fire.
Explosive Ghostflame has an initial 312 magic hit with 130 frost and recurring
60 magic ghostflame ticks with 38 frost. Combined output represents one
occurrence per listed component, not total cast damage; status buildup remains
component-local.

Shattering Crystal exposes three normal/charged per-hit profiles: initial
crystals 127 magic, burst 60 magic, and fragments 51 magic. Ancient Dragons'
Lightning Spear exposes 360/285/122 lightning profiles for spear impact,
secondary strike, and repeated wave. Fortissax's Lightning Spear exposes two
sets: 367/288/122 and 374/292/123 lightning. Repeated Bullet rows are not
multiplied into guaranteed totals. Internal `Light Spear` names are normalized
to their player-facing `Lightning Spear` names. Thirty-four spells are
supported and 137 remain `catalog-only`.

The initial buff catalog supports Golden Vow (aura, 80 seconds, ×1.15 all
outgoing PvE damage) and Flame Grant Me Strength (body, 30 seconds, ×1.20
physical/fire). `buffSpellIds` accepts at most one buff per slot and combines
these two multiplicatively with existing talisman and armor modifiers.
Scholar's Armament (90 seconds, 0.75 magic catalyst scaling), Black Flame Blade
(7 seconds, 0.65 fire), Bloodflame Blade (60 seconds, 0.40 fire), and Electrify
Armament (90 seconds, 0.75 lightning) are normalized weapon-buff records.
Order's Blade adds 0.75 holy catalyst scaling for 90 seconds; its anti-undead
behavior remains outside the current damage model. Vyke's Dragonbolt adds 0.75
lightning scaling for 70 seconds; its equip-load bonus and lightning-defense
penalty remain explicit limitations. Howl of Shabriri is a 40-second body buff
with a 1.25 outgoing multiplier for all five damage types; its incoming-damage
penalty is not part of the outgoing-damage calculation.
Frozen Armament follows its hit-occurrence effect and adds 63 frost buildup per
hit. Poison Armament similarly adds 70 poison buildup per hit. These values are
returned as weapon-buff metadata; proc damage and accumulated status remain
outside the stateless damage request.

Saved builds retain `characterClassId`, level, memory stones, selected spells,
six named weapon slots, spell catalyst, `buffSpellIds`, and an optional
`weaponBuff` catalyst selection. The weapon slots are `rightHand1`,
`rightHand2`, `rightHand3`, `leftHand1`, `leftHand2`, and `leftHand3`. Each slot
is nullable or contains canonical weapon ID, calculation variant, upgrade level,
and optional Ash of War. Duplicate canonical weapons are valid and contribute
their weight independently.
When a class is selected, its derived level, spell requirements, memory capacity,
and equipment catalogs are validated through the same build-stats service used
by the preview API. Ashes must match the stored weapon type and affinity.
General buffs must be supported aura/body effects with no duplicate slot; a
weapon buff must be compatible with the selected buffable weapon and catalyst.
`POST /api/me/builds/:buildId/calculate-damage` is owner-protected and accepts a
stored spell, or a stored weapon-slot ID plus attack or skill and an optional
boss ID. The backend derives a slot's Ash of War and rejects empty slots. Stats
and equipment always come from the stored build rather than client duplicates.

A draft build may keep `characterClassId: null`. In that state level derivation,
resource curves, and spell requirements cannot be finalized, but all supplied
catalog references remain mandatory and are validated against the active game
version. Unknown weapons or variants, excessive upgrade levels, invalid armor
slots, unsupported talismans, unknown spells, and incompatible catalysts or
Ashes of War are rejected before the build is stored.
Weapon damage accepts one `weaponBuff` containing spell ID, catalyst weapon and
variant IDs, and catalyst upgrade level. The backend verifies catalyst type,
ownership, upgrade and attribute requirements plus target-weapon
`EquipParamWeapon.isEnhance`. Catalyst scaling multiplied by 0.75/0.65/0.40/0.75
is added as magic/fire/fire/lightning attack rating before motion values.
Bloodflame delayed bleed and Black Flame percentage DoT remain explicit
limitations. Forty-five spells have supported damage or buff profiles; 126
remain `catalog-only`.

Spell damage accepts up to four unique `talismanIds`. Permanent attribute
bonuses are applied before catalyst scaling. General outgoing-damage,
sorcery/incantation, and applicable charged-spell multipliers are then combined
multiplicatively per damage type. Charged bonuses apply only when `charged` is
true. Conditional HP, successive-hit, event, or equipment-specific effects
remain inactive without authoritative combat state. Talisman response metadata
preserves request order.

## Armor catalog

`GET /api/armor` and `GET /api/armor/:armorId` expose 586 obtainable Regulation-derived
base-game armor pieces. Each entry includes slot, weight, poise, eight physical
or elemental damage-negation values, seven status-resistance values, normalized
supported passive effects, and whether unresolved passive behavior remains.
The supported subset consists of permanent attribute bonuses, resource and FP
cost multipliers, and general incoming-damage multipliers read directly from
resident `SpEffectParam` rows. Direct status-resistance changes and flask
recovery multipliers are included. White Mask, Mushroom Crown, and Black
Dumpling expose their trigger, duration, and five outgoing-damage multipliers,
but their bonuses are not activated without authoritative combat state. Raw
protector and SpEffect IDs remain internal.

Royal Remains regeneration includes its maximum-HP activation threshold and HP
per second for the wearer. Deathbed Dress exposes nearby-ally HP per second and
radius, derived through its Behavior and Bullet references. Stealth, aggro
priority, and Briar dodge-contact damage remain distinct normalized utility
effects rather than being folded into weapon attack rating.

Offensive armor effects are stored as scoped five-type multipliers. Scopes
distinguish specific sorcery/incantation families, named skills or tools,
throwable pots, jumping attacks, and the Silver Tear Mask physical penalty.
They remain inactive unless the selected server-owned attack profile matches
the stored scope; merely equipping the armor does not create a global bonus.
The weapon damage endpoint accepts the selected armor IDs, rejects duplicate
slots, and applies armor attribute bonuses before attack-rating calculation.
It currently activates the Silver Tear physical modifier and Raptor jumping
modifier because normal weapon attack profiles can prove those scopes.

The catalog stores and exposes effect-resolution state per armor item. For the
1.17.0 base-game dataset, 98 distinct resident effects occur on 90 pieces.
Pumpkin Helm is the only partial entry: its reduced-headshot-impact marker is
exposed, while the unavailable engine-side coefficient is not guessed. Crown
glow state rows are classified as visual-only rather than unresolved gameplay.
Import validation rejects changes to these audited invariants.
DLC rows at ID 5000000 and above are excluded until handled as a complete
versioned dataset.

`POST /api/builds/calculate-stats` accepts up to four unique armor IDs and
rejects duplicate slots. It returns selected armor metadata, total armor
weight, total poise, multiplicatively combined damage negation, and status
resistances including armor and talisman points. `hasUnresolvedPassiveEffects`
is true while a selected piece contains resident-effect behavior beyond that
verified subset. Armor attribute bonuses are applied before resource and
protection curves; resource modifiers are applied afterward. Unsupported
conditional or attack-scope-specific behavior is never silently approximated.

The endpoint also accepts up to six unique canonical weapon IDs. Total
equipment load includes armor, supported talismans, and weapons. Load category
uses the final modified maximum equip load: `<30%` light, `<70%` medium, `<100%`
heavy, otherwise overloaded. The response includes current load, maximum load,
ratio, percentage, category, and selected weapon metadata.

## Icon asset storage

The active 1.17.0 catalogs reference 1,454 unique item icon IDs. Local
layout-driven extraction produces 1,453 binary-distinct 160x160 WebP assets at
quality 90, totaling 12,443,076 bytes. No icon is missing and no extracted game
image belongs in Git.

MongoDB stores the images in the `iconassets` collection, deduplicated by
SHA-256. Each document maps one or more icon IDs to one binary image and records
its MIME type, dimensions, byte size, game version, manifest hash, and import
timestamp. The importer verifies every file and replaces the selected version
transactionally. Catalog documents retain only `iconId`.

`GET /api/assets/icons/:iconId` returns the active version's `image/webp`
binary with its exact content length, a strong checksum ETag, and
`Cache-Control: public, max-age=86400, stale-while-revalidate=604800`. Matching
`If-None-Match` requests return 304 without image bytes. Unknown IDs return 404
and malformed non-numeric IDs return 400 through the standard error envelope.
Weapon, armor, talisman, spell, and Ash of War catalog responses expose both
the numeric `iconId` and server-relative `iconUrl` in the form
`/api/assets/icons/:iconId`. The URL is derived at response time and is not
stored redundantly in MongoDB.

---

# Build Visibility

Supported values:

```text
public
private
```

Public builds may be returned by public endpoints.

Private builds may only be returned to their authenticated owner.

---

# Public Build API

```text
GET /api/builds
GET /api/builds/:buildId
```

Requirements:

- only public builds may be returned
- private builds must never leak through these routes

---

# Protected User Build API

All authenticated user-owned build routes use:

```text
/api/me/builds
```

Required routes:

```text
GET    /api/me/builds
POST   /api/me/builds
GET    /api/me/builds/:buildId
PATCH  /api/me/builds/:buildId
DELETE /api/me/builds/:buildId
```

Every route requires valid Clerk authentication.

For individual build access, the backend must verify:

```text
build.ownerId === authenticatedUserId
```

before returning private data or allowing modifications.

---

# Build Creation

Example conceptual request:

```json
{
  "name": "Moonveil Build",
  "description": "Intelligence-focused build",
  "level": 150,
  "stats": {},
  "equipment": {},
  "visibility": "private"
}
```

The request must not need an `ownerId`.

The backend assigns:

```text
ownerId = authenticatedUserId
```

---

# Offensive Output and Damage API

Initial endpoint:

```text
POST /api/damage/calculate
```

The calculation contract supports a request without a boss and a request with a
selected boss. Omitting the boss produces boss-independent offensive output.
Selecting a boss additionally produces estimated damage after defense and
absorption. These outcomes must remain distinguishable in the response.

The endpoint may remain publicly usable.

Authenticated users can load one of their saved builds through protected routes and use its values as calculator input.

---

# Damage Request

Conceptual example:

```json
{
  "weaponId": "moonveil",
  "upgradeLevel": 10,
  "stats": {
    "strength": 12,
    "dexterity": 30,
    "intelligence": 70,
    "faith": 8,
    "arcane": 8
  },
  "attackId": "transient-moonlight-heavy",
  "bossId": "malenia"
}
```

`bossId` is optional. The selected attack identifies a normal weapon attack or
a supported Ash-of-War variant. Multi-component attacks retain their individual
weapon-hit and projectile results.

When `bossId` is provided, the backend resolves the boss for the configured
game version and uses its stored defense and absorption. The request must not
provide authoritative target combat values. Without `bossId`, the endpoint
returns offensive output without a boss-specific damage result.

For normal weapon attacks, `attackId` resolves an imported Regulation attack
profile. Motion values and physical attack type are server-owned values and are
not accepted from normal weapon requests. The verified direct-melee slice covers
29 motion categories with their available one- and two-handed light chains,
heavy and charged-heavy attacks, running, rolling and backstep attacks, guard
counters, and offhand light chains. Regulation 1.17.0 maps 9,810 attack profiles
to 318 melee weapons. Ambiguous jump, critical, mounted, projectile, spell, and
special behaviors remain excluded until separately verified.
Weapon-specific direct behaviors override the motion-category fallback when the
weapon's `behaviorVariationId` defines the same verified attack.

The first persisted weapon-skill slice is Transient Moonlight with its light
and heavy variants. Each retains separate projectile and weapon-hit components,
their FP cost, motion values, added damage, and final damage rates. The public
weapon API exposes only the skill selection data. Damage requests select either
a normal `attackId` or a `skillAttackId`, never both. Skill components are
loaded server-side and calculated separately before their results are summed.

The Regulation skill mapper supports pure weapon-hit, pure projectile, and
mixed skills. Transient Moonlight remains selectable directly on its fixed
weapon; interchangeable skills are selected through the standalone Ash-of-War
catalog.

The standalone Ash-of-War catalog contains all 116 playable Regulation 1.17.0
`EquipParamGem` rows. It stores compatible weapon types and affinities. Twenty
entries are currently `supported`. Thirteen expose verified damage actions:
Square Off, Flame of the Redmanes, Lion's
Claw, Impaling Thrust, Piercing Fang, Stamp (Upward Cut), Stamp (Sweep), and
Giant Hunt, Wild Strikes, Charge Forth, Unsheathe, Prayerful Strike, and
Thunderbolt. Wild Strikes stores
separate profiles for each compatible weapon type so the backend resolves the
correct class-specific motion values. Prayerful Strike damage is supported with
its Regulation 235 motion value and 20 FP cost, resolving the inherited physical
attack type per compatible weapon class; its healing remains an explicit
stateless-calculator limitation. Thunderbolt follows Behavior 300000350 through
Bullet 2080 to AtkParam 301600840 and exposes 120 added lightning damage at a 10
FP cost. The remaining entries are `catalog-only`
until their damage components or buff effects are verified. Seven additional
entries expose verified buff effects: Sacred Blade (+90 holy, 40 seconds),
Flaming Strike (+90 fire, 40 seconds), Lightning Slash (+85 lightning, 40
seconds), Determination (×1.60 next hit within 10 seconds), Royal Knight's
Resolve (×1.80 next hit within 10 seconds), Seppuku (+30 physical and 30 bleed
buildup, 60 seconds), and Cragblade (×1.15 physical attack power and ×1.10 poise
damage, 60 seconds). Seppuku self-damage and Sacred Blade's anti-undead behavior
remain explicit limitations. Public routes are:

The completed MVP Ash-of-War calculation scope is:

| Ash of War | Supported actions |
| --- | --- |
| Square Off | light and heavy follow-up |
| Flame of the Redmanes | projectile |
| Lion's Claw | weapon hit |
| Impaling Thrust | weapon hit |
| Piercing Fang | weapon hit |
| Stamp (Upward Cut) | upward-cut follow-up |
| Stamp (Sweep) | complete two-hit sweep |
| Giant Hunt | weapon hit |
| Wild Strikes | both loop hits and both complete follow-ups for all nine compatible weapon types |
| Charge Forth | full sequence and early-release sequence |
| Unsheathe | light and heavy follow-up |

This list refers only to interchangeable Ashes in the standalone catalog.
Transient Moonlight is a completed fixed Moonveil skill and is not counted
among these eleven Ashes.

```text
GET /api/ashes-of-war
GET /api/ashes-of-war?weaponType=straight-sword
GET /api/ashes-of-war?affinity=heavy&calculationStatus=catalog-only
GET /api/ashes-of-war/:ashOfWarId
```

Regulation source IDs and damage components remain server-owned.

Weapon damage requests provide canonical `weaponId` and calculation
`weaponVariantId`. Attacks and fixed skills resolve from the canonical weapon;
attack rating resolves from the variant after ownership validation. The
response includes the selected affinity. Interchangeable Ash-of-War requests
add `ashOfWarId` and `skillAttackId`; compatibility is checked against both the
weapon type and variant affinity. A missing skill, unknown Ash, foreign variant,
or incompatible combination is rejected.

---

# Damage Response Contract

All JSON endpoints use the envelope:

```json
{
  "status": 200,
  "message": "Damage calculated",
  "data": []
}
```

`data` is always an array. Successful single-resource and calculation responses
contain one object; list responses contain zero or more objects; error and
not-found responses contain an empty array. The icon-asset endpoint is the only
current exception because it returns binary WebP data directly.

Damage calculations return their result as the only entry in `data`. A direct
weapon, Ash-of-War, or spell calculation contains the selected source metadata,
submitted and effective stats where applicable, applied equipment and buffs,
attack rating, attack metadata, component results, combined offensive output,
and `accuracy: "estimated"`. Each component retains its kind, source attack ID,
and boss-independent `offensiveOutput` per damage type plus a total.

Example result object, abbreviated:

```json
{
  "attackRating": {
    "physical": 210,
    "magic": 376,
    "fire": 0,
    "lightning": 0,
    "holy": 0,
    "total": 586
  },
  "damage": {
    "physical": 142,
    "magic": 218,
    "fire": 0,
    "lightning": 0,
    "holy": 0,
    "total": 360
  }
}
```

Without a boss, `target` and `damage` are omitted and the response represents
boss-independent offensive output. With a boss, `target` identifies the stored
boss and every component plus the combined result includes estimated `damage`
after defense and absorption. Multi-projectile, spread, channelled, and
multi-component spells additionally expose their verified output unit,
status-per-component, aggregation assumption, and explicit limitations; the API
does not infer total hit counts or duration.

---

# Damage Calculation Strategy

Damage calculations are backend domain logic.

Initial pipeline:

```text
Weapon Data
  -> Reinforcement
  -> Attribute Scaling
  -> Attack Rating per Damage Type
  -> Attack / Motion Modifier where required
  -> Boss-independent offensive output
  -> Optional target defense
  -> Optional target absorption
  -> Optional estimated boss damage
```

Initial damage types:

- physical
- magic
- fire
- lightning
- holy

---

# Damage Domain Functions

Potential domain functions:

```text
calculateAttackRating()
calculateAttributeScaling()
calculateDefenseReduction()
calculateAbsorption()
calculateHitDamage()
```

Domain calculation functions should be pure where possible and independently testable.

They must not depend directly on Express, Mongoose, or Clerk.

---

# Damage Accuracy

The application must distinguish between:

- exact game-derived values
- calculated values
- approximations

The implemented formula should be documented.

Known unsupported mechanics must be documented explicitly.

---

# Damage MVP Scope

Included:

- weapon selection
- weapon upgrade level
- strength
- dexterity
- intelligence
- faith
- arcane
- reinforcement
- attribute scaling
- attack rating
- target defense
- target absorption
- damage per hit
- physical damage
- magic damage
- fire damage
- lightning damage
- holy damage
- selected regulation-verified Ash of War damage
- multi-component skill attacks such as a weapon hit plus projectile

---

# Current Damage Support Boundaries

The following remain intentionally unsupported unless a verified profile says
otherwise:

- DPS
- full combo simulation
- bleed proc damage
- poison and other status proc damage
- frost proc damage
- complete status-effect system
- full buff system
- PvP-specific calculations
- damage for the 137 `catalog-only` spells
- the 96 `catalog-only` Ashes of War and unverified fixed weapon skills
- complete talisman damage modifiers

---

# Validation

Zod validates:

- request bodies
- route parameters
- query parameters
- build data
- damage calculator input
- relevant imported ERDB-derived data

Invalid requests return appropriate 4xx responses.

---

# REST API

Current public routes:

```text
GET  /api/health
GET  /api/weapons
GET  /api/weapons/:weaponId
GET  /api/armor
GET  /api/armor/:armorId
GET  /api/talismans
GET  /api/talismans/:talismanId
GET  /api/spells
GET  /api/spells/:spellId
GET  /api/ashes-of-war
GET  /api/ashes-of-war/:ashOfWarId
GET  /api/bosses
GET  /api/bosses/:bossId
GET  /api/character-classes
GET  /api/builds
GET  /api/builds/:buildId
POST /api/builds/calculate-stats
POST /api/damage/calculate
GET  /api/assets/icons/:iconId
```

Protected authenticated-user routes:

```text
GET    /api/me/builds
POST   /api/me/builds
GET    /api/me/builds/:buildId
PATCH  /api/me/builds/:buildId
DELETE /api/me/builds/:buildId
POST   /api/me/builds/:buildId/calculate-damage
```

API design should remain resource-oriented.

---

# Pagination, Search, Filtering, and Sorting

Compendium endpoints add only the query behavior required by their current UI
contract. Weapons support `page`, `limit`, `search`, and `affinity`, return the
matching total through `X-Total-Count`, and use a stable server-owned sort.
Spells and Ashes of War support their documented filters. Other
catalog routes currently return their complete base-game arrays.

Before a complete catalog becomes a demonstrated performance problem, do not
add speculative pagination abstractions. If pagination is introduced, preserve
the array response contract and expose the total through `X-Total-Count`.

Future query capabilities may include:

- pagination
- search
- filtering
- sorting

Large datasets should not be sent completely to the client when unnecessary.

---

# Error Handling

Use centralized error handling.

Expected response codes include:

- 200
- 201
- 204
- 400
- 401
- 403
- 404
- 409
- 500

API errors should use a consistent response structure.

Internal stack traces must not be exposed to clients.

---

# Database

The development database is MongoDB Atlas and uses the database name
`gracebound`. It may share an Atlas cluster with another project, but it must
not share that project's database namespace.

The game-data import updates multiple collections in a MongoDB transaction.
Consequently, the configured deployment must support transactions. Atlas Free
clusters use replica sets and satisfy this requirement; standalone local
MongoDB instances do not.

MongoDB stores:

Application-owned data:

```text
builds
favorites (optional)
users (optional)
```

Normalized imported game data:

```text
weapons
armor
talismans
bosses
calculation-related data
```

Exact game-data persistence may evolve during ERDB integration.

---

# Users

A separate application user collection is not required by default.

Clerk remains the authentication source.

Create a local user collection only if the application requires additional persisted profile data.

---

# Security

Required:

- authenticate all protected routes
- enforce ownership
- never trust owner IDs from the client
- never expose private builds publicly
- validate all input
- protect secrets
- avoid leaking internal server details
- safely handle user-generated content

---

# Testing

Backend testing stack:

- Vitest
- Supertest

Priority:

1. damage calculation domain logic
2. authorization and ownership
3. protected build CRUD
4. validation
5. game-data transformation
6. public API behavior

Reference-based damage tests should be added where reliable known values are available.

MongoDB integration tests cover class-level attacks, weapon-specific behavior
overrides, attacks selected for the wrong weapon, optional boss resolution, and
the empty `attacks` array for unsupported weapon categories.

---

# Configuration

Use environment variables for configuration.

Examples:

```text
DATABASE_URL
CLERK_SECRET_KEY
PORT
```

Secrets must never be committed.

Required configuration should be validated during startup.

---

# Out of Scope for MVP

Not required:

- comments
- ratings
- social following
- notifications
- WebSockets
- complete quest system
- full NPC database
- PvP simulation
- DPS simulation
- full status-effect simulation
- complete buff system
- complete Elden Ring mechanic coverage

---

# Open Technical Decisions

The following implementation details remain open:

1. user-facing labels for remaining Regulation behavior and attack identifiers
2. whether further catalog routes need pagination after frontend measurements
3. exact deployment platform and its operational configuration

These decisions should be resolved explicitly and documented rather than guessed during implementation.

---

# Definition of Done

The final backend should:

- build successfully for production
- connect to MongoDB
- verify Clerk authentication
- provide protected authenticated-user routes
- enforce build ownership
- prevent private build exposure
- expose normalized game-data endpoints
- expose boss-independent offensive output
- expose estimated damage against a selected boss
- provide build CRUD
- provide a working damage-per-hit endpoint
- contain deterministic domain tests
- contain authorization tests
- validate external input
- follow the documented architecture
