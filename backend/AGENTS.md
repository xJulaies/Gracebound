# AGENTS.md

## Purpose

This document defines development rules, architecture, security expectations, and quality standards for the backend of the Elden Ring Companion application.

The backend provides:
- the application's REST API
- user-owned build data
- authentication and authorization
- regulation-derived game data
- damage-calculation domain logic

The project should demonstrate clean backend development without unnecessary enterprise complexity.

---

# Core Principles

## 1. Clear responsibility boundaries

Separate:
- HTTP handling
- validation
- authentication
- authorization
- business logic
- persistence
- game-data ingestion
- domain calculations

Controllers should remain thin.

Database models must not become service layers.

Complex domain logic must not live inside Express route handlers.

## 2. Prefer practical architecture

Use architecture that improves clarity and testability.

Do not create layers purely for theoretical purity.

Simple features do not need every possible abstraction.

## 3. KISS and YAGNI

KISS (Keep It Simple, Stupid) and YAGNI (You Aren't Gonna Need It) must be followed in every implementation and architectural decision.

Prefer the simplest solution that clearly satisfies the current verified requirements.

Do not introduce:
- speculative abstractions
- unused extension points
- premature generalization
- infrastructure for hypothetical future features
- additional layers without an immediate testability or clarity benefit

Add complexity only when a concrete requirement or demonstrated limitation makes it necessary.

## 4. Feature-based modular architecture

The backend uses feature-based organization.

Example:

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
    regulation/

  shared/
    errors/
    middleware/
    validation/
    utils/

  app.ts
  server.ts
```

A feature may contain:

```text
feature/
  routes/
  controllers/
  services/
  repositories/
  schemas/
  models/
  types/
  domain/
```

Only create folders and layers that are actually needed.

---

# Request Flow

Preferred request flow:

```text
HTTP Request
  -> Route
  -> Authentication if required
  -> Validation
  -> Authorization if required
  -> Controller
  -> Service
  -> Repository / Domain / Game Data Provider
  -> Response
```

---

# TypeScript

Use TypeScript strictly.

Avoid `any`.

Use explicit domain types.

Do not trust imported game data blindly.

Imported data must be validated and mapped before becoming application domain data.

---

# Express

Express is the HTTP framework.

Keep routes readable.

Controllers should:
- read validated request data
- call services
- return HTTP responses

Controllers should not contain complex business logic.

---

# Validation

Use Zod for:

- request bodies
- route parameters
- query parameters
- relevant imported game data
- environment configuration where useful

Never trust frontend validation.

The backend is the final validation boundary.

---

# Authentication

Authentication is handled through Clerk.

Protected routes must verify authentication on the backend.

Never trust:
- client-supplied user IDs
- frontend visibility rules
- frontend ownership checks

The authenticated user identity must come from the verified Clerk authentication context.

---

# Authorization

Authentication and authorization are separate concerns.

Being authenticated does not automatically permit access to a resource.

Every endpoint that accesses user-owned resources must be treated as protected by default.

The backend must enforce ownership.

Example rule:

```text
build.ownerId === authenticatedUserId
```

before allowing:
- private reads
- updates
- deletion
- visibility changes

UI restrictions are never considered a security boundary.

---

# Protected Build Routes

User-owned build routes should use the authenticated-user namespace:

```text
/api/me/builds
```

Expected protected routes:

```text
GET    /api/me/builds
POST   /api/me/builds
GET    /api/me/builds/:buildId
PATCH  /api/me/builds/:buildId
DELETE /api/me/builds/:buildId
POST   /api/me/builds/:buildId/calculate-damage
```

The client must not choose the owner.

On creation, the backend assigns:

```text
ownerId = authenticatedUserId
```

Do not accept an `ownerId` from the request body.

Saved builds persist the character class, memory stones, spell loadout, six
fixed weapon slots (`rightHand1` through `rightHand3` and `leftHand1` through
`leftHand3`), spell catalyst, aura/body buff IDs, and optional weapon-buff
catalyst. Each occupied weapon slot owns its canonical weapon ID, calculation
variant, upgrade level, and optional Ash of War.
Validate active-version catalog references, class-derived level, spell capacity
and requirements, weapon/Ash compatibility, catalyst compatibility, and buff
slots before writing. Saved-build damage requests supply only a selected stored
spell or a weapon-slot ID plus attack/skill action and optional boss; the backend
derives the weapon, Ash of War, stats, and other equipment from the owned build.

Draft builds may omit a character class, but this never disables catalog
validation. Validate every selected weapon and variant, upgrade bound, armor
item and slot, supported talisman, spell, catalyst, and Ash of War against the
active game version before persistence.

---

# Public Build Routes

Public build access is separate from authenticated owner access.

Example:

```text
GET /api/builds
GET /api/builds/:buildId
```

Public endpoints must return only builds that are actually public.

Private builds must never be exposed through public routes.

---

# MongoDB

MongoDB is the primary application database.

Use Mongoose.

The development database is hosted in MongoDB Atlas. The configured database
name is `gracebound`; unrelated projects must use separate database names even
when they share the same Atlas cluster.

Game-data imports write multiple collections transactionally. The target
MongoDB deployment must therefore support transactions, as Atlas replica sets
do. A standalone local MongoDB server is not sufficient for this import path.

Application-owned data includes at minimum:

```text
builds
```

Potential collections:

```text
favorites
users
```

A custom user collection should only be introduced if application-specific profile data is required beyond Clerk.

---

# Regulation Data

Validated exports from the locally installed Elden Ring `regulation.bin` are
the intended primary source for technical weapon, NPC, boss, and calculation
data. Smithbox is currently used to export the required parameter tables as
CSV files.

The active application dataset is Elden Ring `1.17.0`. Runtime defaults, test
fixtures, imports, and API queries must use this version unless a test is
explicitly verifying version isolation or historical import compatibility.

Raw game files and generated CSV exports are local input artifacts. Do not
commit or redistribute `regulation.bin` or its full raw exports.

Preferred flow:

```text
Local regulation.bin
  -> Smithbox CSV export
  -> Validation
  -> Mapping and calculation
  -> Application domain models
  -> Application game-data storage
  -> REST API
```

The application must depend on its own domain models, not Smithbox column names
or raw regulation structures.

Each imported dataset should record the game version and source-file hash where
practical. Preserve encounter, location, and phase distinctions where their
combat values differ. Do not silently present uncertain mappings as exact.

The verified Elden Ring 1.17.0 base-game boss catalog contains 177 distinct
combat profiles. Boss names and `NpcParam` mappings were cross-checked against
local EMEVD health-bar events, MSB map entities, and English `NpcName.fmg`
entries. Repeated encounters with the same display name and `NpcParam` row are
stored once; differing regional rows and named phases remain distinct.
Shadow of the Erdtree map files are not available in the current local source
installation, so DLC bosses must not be included or guessed until those source
files can be validated.

Before importing a new Regulation version, compare it with the previous local
exports and run both importers with `--dry-run`. Version-specific catalog-count
guards must block incomplete datasets before MongoDB is opened. Missing source
names must be resolved explicitly; unnamed new equipment must not be silently
excluded from a production import.

When Smithbox Param row names lag behind the game text, resolve player-facing
names from the matching English `WeaponName.fmg` and keep the smallest possible
version-specific mapping in code. Unnamed rows that also have no player-facing
FMG entry remain excluded as internal data.

ERDB remains an existing comparison and fallback source during migration. Do
not remove the ERDB importer until regulation-derived weapon results have been
tested against known reference weapons and all required mappings are covered.

The regulation weapon catalog treats a canonical player armament separately
from its calculation variants. Standard, Heavy, Keen, Quality, Fire, Flame Art,
Lightning, Sacred, Magic, Cold, Poison, Blood, and Occult rows are affinities of
one weapon rather than independent catalog entries. Internal, NPC, test, and
non-armament rows must be excluded structurally and reported by the importer.

---

# Game Data Import

Game data should be imported or transformed through a repeatable process.

The application must not read Smithbox exports or call ERDB during normal user
requests.

The import pipeline should conceptually follow:

```text
Local regulation export
  -> import
  -> validate
  -> normalize
  -> application game-data storage
```

Imported game data is treated as read-only application data.

The imported dataset should record the supported Elden Ring game version where practical.

The existing weapon import uses the official ERDB API container
`ghcr.io/eldenringdatabase/erdb-api:0.4.0` locally. The importer requests only
`armaments`, `reinforcements`, `correction-attack`, and `correction-graph` for
the configured game version. It must validate all four raw responses before
mapping or connecting to MongoDB.

It remains available during the controlled migration to regulation-derived
weapon data. The container performs a precache step before serving HTTP. Import commands
must not run until its logs report that Uvicorn is running on port `8107`.
Operational commands and configuration belong in
`src/infrastructure/erdb/README.md`.

---

# Game Data Persistence

Game data and user-owned application data must remain logically separated.

Possible game-data collections include:

```text
weapons
armor
talismans
bosses
scalingCurves
reinforcementData
attackData
```

The exact schema depends on the finalized regulation mapping.

Do not store raw regulation or ERDB records if normalized application models
are more appropriate.

## Icon assets

Game icons are extracted locally from the UXM-unpacked `menu/hi` atlases and
must never be committed. Use the layout-defined `iconId` mapping, convert only
IDs referenced by the active game-data catalogs to 160x160 WebP at quality 90,
and deduplicate binary-identical files by SHA-256.

MongoDB stores one `iconassets` document per unique image. The document owns
all matching icon IDs, binary WebP data, dimensions, checksum, byte size, game
version, source-manifest hash, and import timestamp. Keep image bytes out of
weapon, armor, talisman, spell, Ash of War, Great Rune, and Crystal Tear documents. The compound indexes
on game version plus checksum and game version plus icon ID must remain unique.

Icon imports must validate the complete manifest and every file before opening
MongoDB, enforce the 150 MiB asset budget, and replace one game-version dataset
transactionally. For spells, join `Magic` to the same-ID `EquipParamGoods` row
and use the Goods icon ID; `Magic.iconId` is only a spreadsheet reference.
After catalog or icon imports, audit the active catalog icon IDs against the
stored assets. Missing referenced icons must fail the audit; unreferenced stored
icons must be reported so dataset drift remains visible.

Character-class carousel images are locally captured source artifacts and must
not be committed. Store the ten optimized 520x624 WebP images in the dedicated
`characterclassimageassets` collection, one document per playable base-game
class and game version. Validate the complete manifest, image dimensions,
format, byte size, and SHA-256 checksum before opening MongoDB. Replace one
game-version image set transactionally. Character-class catalog responses
derive `imageUrl` from the class ID; image bytes remain separate from class
documents.

---

# Domain Models

Backend domain models should use readable application terminology.

Example:

```ts
interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  requirements: AttributeRequirements;
  attack: DamageTypes;
  scaling: WeaponScaling;
  reinforcement: ReinforcementType;
}
```

Source identifiers may be preserved internally when required for mapping but
should not dictate the whole application model.

---

# REST API

Use resource-oriented routes.

Public game-data examples:

```text
GET /api/weapons
GET /api/weapons/:weaponId

GET /api/armor
GET /api/armor/:armorId

GET /api/talismans
GET /api/talismans/:talismanId

GET /api/spells
GET /api/spells/:spellId

GET /api/great-runes
GET /api/great-runes/:greatRuneId

GET /api/crystal-tears
GET /api/crystal-tears/:crystalTearId

POST /api/builds/calculate-stats

GET /api/character-classes

GET /api/bosses
GET /api/bosses/:bossId

GET /api/assets/icons/:iconId
GET /api/assets/character-classes/:classId
```

The public icon endpoint returns the active game version's WebP bytes directly,
not the normal JSON response envelope. It must validate numeric icon IDs, return
404 for unknown IDs, and emit the checksum as a strong ETag. Because the URL is
not versioned, use a revalidating cache policy rather than `immutable` caching.
Public weapon, armor, talisman, spell, Ash of War, and Great Rune response mappers must
derive a server-relative `iconUrl` from `iconId`; never persist deployment
hostnames or duplicate the URL in catalog documents.

The base-game Physick catalog contains exactly 32 Crystal Tear goods rows.
Builds and calculation requests accept at most two unique supported Tear IDs.
Preserve selection order. Apply knot attribute bonuses before requirements and
scaling, resource multipliers after resource curves, and Shrouding outgoing
damage multipliers after attack rating. Never activate catalog-only Tears or
infer conditional combat behavior.
Spiked applies its per-type multiplier only to charged attacks. Stonebarb
exposes a poise-damage multiplier without inventing absolute stance damage.
Opaline Hardtear contributes PvE incoming-damage multipliers. Cerulean Hidden
multiplies effective skill, sorcery, and incantation FP costs by zero for its
verified duration.
Greenburst exposes its flat stamina-recovery-speed bonus. Winged multiplies
maximum equip load before load-category calculation. Speckled Hardtear keeps
its +90 resistance bonuses separate from its one-time cleanse of poison, rot,
bleed, frost, sleep, madness, and death blight buildup.
Keep Physick recovery typed by timing: Crimson and Cerulean restore a fraction
of maximum HP or FP once, while Crimsonburst exposes HP per second and duration.
Duplicate collectible Tears keep distinct IDs and their immediate recovery may
combine. Never merge one-time recovery into maximum-resource multipliers.

The Regulation 1.17.0 Great Rune catalog contains exactly seven base-game
entries. Godrick's, Radahn's, and Morgott's expose verified permanent Rune Arc
effects. Keep Rykard's, Mohg's, and Malenia's catalog-only until authoritative
combat or multiplayer state exists. The Great Rune of the Unborn is
`not-applicable` to Rune Arc combat calculations. Build-stat requests accept at
most one Great Rune. Apply its attribute bonuses before resource and protection
curves, then apply its HP/FP/stamina multipliers to the curve output. Saved
builds retain the optional Great Rune ID. Weapon and spell damage requests use
the same optional selection and apply verified attribute bonuses before weapon
or catalyst scaling and all attribute-requirement checks. Never apply resource
multipliers to offensive damage.

The Regulation 1.17.0 base-game spell catalog contains 70 sorceries and 101
incantations from `Magic.csv`. Exclude NPC-prefixed rows, IDs 4641/4642, the
duplicate Briars casting rows 8000/8001, and DLC IDs from 2000000 onward.
Correct the internal casting-category mismatches for Death Lightning
(incantation) and Night Maiden's Mist (sorcery). Public entries expose base FP
cost, memory slots, Intelligence/Faith/Arcane requirements, icon, and
`catalog-only` calculation status. Do not infer charged FP cost or spell damage
until the corresponding behavior, bullet, attack, and catalyst data is mapped.

The talisman catalog uses named base-game `EquipParamAccessory` rows below ID
7000. Regulation 1.17.0 must map exactly 116 entries. IDs 7000 and above require
a separate complete Shadow of the Erdtree import. Store the internal
accessory and effect IDs for later mapping, but expose only normalized selection
data. Talisman effects remain `catalog-only` until their complete conditions and
modifiers are verified from `SpEffectParam`; never infer support from the
talisman name alone.

The armor catalog uses the 586 obtainable, uniquely named base-game `EquipParamProtector`
rows below ID 5000000 in the four wearable categories. Exclude the internal
zero-weight `Head`, `Body`, `Arms`, and `Legs` placeholders and the unavailable
cut-content `Grass Hair Ornament` (row 920000). Convert
`*DamageCutRate` multipliers to normalized negation decimals with `1 - rate`,
map `toughnessCorrectRate * 1000` as poise, and preserve all seven resistance
point values. Negative damage negation is valid for equipment that increases
incoming damage and must not be clamped to zero. Join resident `SpEffectParam`
rows during import. The supported safe subset is permanent attribute bonuses,
HP/FP/stamina/equip-load multipliers, skill/sorcery/incantation FP-cost
multipliers, and the five general incoming-damage multipliers. Apply attribute
bonuses before progression curves, then resource multipliers. Keep resident IDs
internal. Also preserve direct status-resistance changes, Crimson/Cerulean
flask recovery multipliers, and the verified 20/60-second triggered attack
boosts for White Mask, Mushroom Crown, and Black Dumpling. Triggered boosts are
catalog metadata until the server receives authoritative combat state; never
apply them unconditionally. Mark pieces with remaining resident behavior as partially unresolved until
their conditional and attack-scope-specific fields are verified. DLC armor
requires a separate complete import.

Royal Remains pieces expose their Regulation HP threshold and per-second wearer
regeneration. Deathbed Dress ally healing must follow the verified
`SpEffectParam -> BehaviorParam_PC -> Bullet -> SpEffectParam` chain and retain
its radius; do not treat it as wearer healing. Preserve Black Knife Armor's
enemy-hearing multiplier, Duelist/Rotten Duelist aggro-priority modifier, and
Briar-set dodge-contact physical damage as separate utility fields. These
values are not generic weapon damage modifiers.

Offensive armor modifiers must retain their verified scope. Supported scopes
include thorn/cold/comet/glintstone-stars sorceries, Comet Azur, Noble Presence,
Crucible and Golden Order incantations, glintstone and Envoy bubble weapon
skills, Omen Bairn tools, Ancestral Infant, throwable pots, jumping attacks,
and Silver Tear Mask's all-physical penalty. Combine matching pieces only when
the server-owned attack, spell, skill, or consumable profile proves the scope;
the client must not activate a scope with an arbitrary boolean.
`POST /api/damage/calculate` accepts up to four unique armor IDs with one item
per slot. Apply armor attribute bonuses before weapon attack rating. Of the
scoped armor modifiers, apply Silver Tear Mask to physical output and Raptor's
Black Feathers only when the resolved normal attack profile is a jumping
attack. Other scopes remain cataloged until their own server-owned attack
profiles exist.

Armor effect resolution is stored per catalog item and exposed as
`hasUnresolvedPassiveEffects`; do not derive it merely from the presence of a
resident effect ID. The 1.17.0 audit must find exactly 98 distinct resident
effect IDs across 90 armor pieces. Only Pumpkin Helm remains partial: state
marker 450 proves reduced headshot impact, but Regulation does not expose the
engine-side numeric coefficient used to calculate it. Crown glow rows 486 and
1950-1958 are verified non-gameplay markers and must not be reported as
unresolved. Any inventory drift must fail import validation.

Permanent attribute bonuses are the first supported talisman effect group. Read
them from `SpEffectParam.add*Status`, apply them before weapon attack-rating
calculation, cap effective attributes at 99, and preserve the submitted base
attributes in the response. The verified initial set is Starscourge Heirloom,
Prosthesis-Wearer Heirloom, Stargazer Heirloom, and Two Fingers Heirloom.
Reject unknown, duplicate, excessive, and `catalog-only` talisman selections.

Radagon's and Marika's Scarseal/Soreseal are also supported permanent effects.
Never model only their beneficial attributes: persist all eight attribute
bonuses together with their incoming physical, magic, fire, lightning, and holy
damage multipliers. The weapon calculator consumes only relevant scaling stats;
the remaining normalized metadata belongs to future player-defense logic.

The four Scorpion Charms are the verified permanent elemental-multiplier group.
Use the PvE `atkEnemyDmgCorrectRate_*` fields: +12% applies only to the matching
element after component motion value, added damage, and final-damage rate. Do
not rewrite weapon attack rating. Preserve their +10% physical incoming-damage
penalty from `defEnemyDmgCorrectRate_Physics`.

Warrior Jar Shard and Shard of Alexander use the `skill-only` multiplier scope.
Apply their Regulation `physicsAttackRate`, `magicAttackRate`, `fireAttackRate`,
`thunderAttackRate`, and `darkAttackRate` only when `skillAttackId` selects an
Ash of War or fixed weapon skill. Normal `attackId` requests must remain
unchanged.

The Axe Talisman uses the `charged-attack` scope. Resolve this from the selected
verified normal attack profile (`charged-heavy`), not from a client-supplied
boolean. Apply its `1.10` damage-type multipliers only to fully charged normal
heavy attacks; uncharged attacks and skills remain unchanged.

Dragoncrest Shield, Dragoncrest Greatshield, Spelldrake, Flamedrake, Boltdrake,
Haligdrake, and Pearldrake variants are supported permanent PvE damage-negation
effects. Read all five damage-type multipliers from the corresponding
`defEnemyDmgCorrectRate_*` fields. Preserve these values in the catalog even
while the outgoing-damage endpoint does not calculate damage received by the
player.

Crimson, Cerulean, and Viridian Amber Medallions, Arsenal Charm variants, and
Erdtree's Favor variants are supported permanent resource effects. Map maximum
HP, FP, stamina, and equip load directly from `maxHpRate`, `maxMpRate`,
`maxStaminaRate`, and `equipWeightChangeRate`. Store neutral `1` multipliers as
part of the complete effect contract; do not fabricate derived absolute values
without the character-stat formula.

Horn Charm, Prince of Death, and Mottled Necklace variants are supported
permanent status-resistance effects. Preserve Regulation's individual poison,
rot, bleed, frost, sleep, madness, and death-blight point bonuses instead of
collapsing them into UI summary labels such as Immunity or Robustness.

Graven-School and Graven-Mass are supported sorcery-only damage effects;
Faithful's Canvas and Flock's Canvas are supported incantation-only damage
effects. Keep these as separate spell scopes even though Regulation stores the
same scalar in `magicAttackRate`. They must never modify weapon magic damage or
weapon skills.

Silver and Gold Scarabs, Moon of Nokstella, Green Turtle Talisman, Bull-Goat's
Talisman, and Carian Filigreed Crest are supported permanent utility effects.
Keep their discovery-rate bonus, rune multiplier, memory-slot bonus, stamina
recovery bonus, poise-damage multiplier, and skill FP-cost multiplier in
separate typed fields; do not combine values with different units.

Old Lord's Talisman, Radagon Icon, and Primal Glintstone Blade are supported
permanent spell utility effects. Map effect duration, virtual casting Dexterity,
and spell FP cost from `extendLifeRate`,
`dexterityCancelSystemOnlyAddDexterity`, and `magicConsumptionRate`. Primal
Glintstone Blade's `maxHpRate` penalty is mandatory and must not be omitted.

Crimson Seed, Cerulean Seed, and Blessed Dew are supported permanent recovery
effects. Map flask multipliers directly. Regulation stores periodic healing as
a negative `changeHpPoint`; expose Blessed Dew as a positive HP-per-second value
derived using `motionInterval`, and reject silent sign or unit assumptions in
other periodic effects.

Hammer Talisman and Greatshield Talisman are supported guard-specific effects.
Keep outgoing stamina damage and incoming guard stamina cost separate from HP
damage. Daedicar's Woe is a supported unconditional incoming-damage modifier;
preserve its `2.0` multiplier for all five damage types.

Spear, Dagger, Twinblade, Lance, Claw, and Curved Sword Talismans use distinct
conditional attack scopes: counterattack, critical, final chain attack, mounted,
jumping, and guard counter. Persist their verified damage-type multipliers, but
apply them only when a server-owned attack profile proves the condition. Never
accept a client boolean as proof and never apply them to every weapon attack.

Red- and Blue-Feathered Branchsword activate at 20% HP or below; Ritual Sword
and Ritual Shield activate at 100% HP. Store both the Regulation threshold and
the correct outgoing or incoming damage-type multipliers. Do not activate these
effects until current and maximum HP are available as validated server state.

Arrow's Reach, Arrow's Sting, Roar Medallion, and Godfrey Icon use distinct
projectile-range, ranged-damage, roar/breath-damage, and charged-spell/skill
scopes. Preserve `bowDistRate` as its Regulation bonus value. Apply damage scopes
only to verified compatible server-owned profiles, never to generic attacks.

Companion Jar and Perfumer's Talisman use separate throwable-pot and perfume
damage scopes. Persist all five Regulation damage-type multipliers, and never
apply either effect to weapons, skills, spells, or the other consumable category.

Winged Sword Insignia, Rotten Winged Sword Insignia, and Millicent's Prosthesis
must retain their Regulation accumulator thresholds and boost stages rather than
one maximum multiplier. Read linked trigger/boost `SpEffectParam` rows, preserve
stage duration, and include Millicent's permanent +5 Dexterity. Stage activation
requires a future server-owned successive-hit state.

Lord of Blood's Exultation and Kindred of Rot's Exultation use separate nearby
blood-loss and poison/rot triggers. Validate their Regulation state-change IDs,
follow `cycleOccurrenceSpEffectId`, and preserve the timed five-type damage
boost. Runtime activation requires a server-owned status-trigger event.

Taker's Cameo, Godskin Swaddling Cloth, both Assassin's Daggers, and Ancestral
Spirit's Horn are event-recovery effects. Preserve trigger, accumulator threshold
where applicable, maximum-HP percentage, flat HP, and flat FP components from
their linked `SpEffectParam` rows. Regulation stores recovery as negative change
values; expose positive recovery values. Runtime activation needs server events.

Crepus's Vial, Longtail Cat Talisman, Shabriri's Woe, Sacrificial Twig, and both
Trick-Mirrors are supported miscellaneous effects. Validate their Regulation
state/VFX markers and preserve silence, fall-damage multiplier, target-priority
modifier, rune-loss prevention, and appearance mode as separate fields.

Crucible Scale, Feather, and Knot plus Concealing Veil are supported special
defense/stealth effects. Validate their state markers. Preserve Scale's
critical-damage multipliers, Feather's complete `1.3` incoming-damage tradeoff
and linked dodge-effect timing, Knot's headshot-impact reduction, and Veil's
crouched-at-distance concealment. Do not reinterpret these as generic defense.

`POST /api/builds/calculate-stats` is the shared talisman build-stat calculation.
It accepts a Regulation-backed character class, all eight base attributes, and
up to four unique supported talismans. Character level is the class starting
level plus every attribute point invested above that class's starting values.
Reject attributes below the selected class's starting values.
Calculate base HP, FP, stamina, and equip load from `CalcCorrectGraph` rows 100,
101, 104, and 220 using effective attributes. Apply resource multipliers only
after the base resource value has been resolved. Keep the source curves
versioned in MongoDB; runtime requests must not read local CSV files.
Player flat defenses use the level curve at `characterLevel + 79`, plus the
verified governing attribute curve: Strength for physical, Intelligence for
magic, Vigor for fire, no attribute curve for lightning, and Arcane for holy.
Status resistances use their level curves at the same offset plus Vigor for
poison/rot, Endurance for bleed/frost, Mind for sleep/madness, and Arcane for
death blight. Floor only the combined value, then add flat talisman bonuses.
Item Discovery is `CalcCorrectGraph` row 140 evaluated with effective Arcane,
multiplied by 100 and floored. Add Silver Scarab-style Regulation bonuses only
afterward; `itemDropRate: 0.75` represents 75 displayed discovery points.

`POST /api/builds/calculate-stats` accepts up to four unique armor IDs, with at
most one item per head, body, arms, and legs slot. Add weight, poise, and status
resistance points. Combine armor negation multiplicatively as
`1 - product(1 - pieceNegation)` for every damage type. Preserve request order
in response metadata. Apply only the verified passive subset described above,
return its normalized values, and report that remaining resident-effect fields
are unresolved rather than inferring them.

The same endpoint accepts up to six unique canonical weapon IDs. Equipment
load is the sum of selected armor, talisman, and weapon weights. Compare it to
the final maximum equip load after attribute and resource modifiers. Classify
ratios below 30% as `light`, below 70% as `medium`, below 100% as `heavy`, and
100% or above as `overloaded`. Return current load, maximum load, ratio, and
percentage so the frontend does not need to duplicate game rules.
Return submitted and capped effective attributes separately; add resistance
points and multiply resource/incoming-damage modifiers. Keep multiplier output
decimal-stable. Unknown and `catalog-only` selections are rejected.

Public build examples:

```text
GET /api/builds
GET /api/builds/:buildId
```

Protected build examples:

```text
GET    /api/me/builds
POST   /api/me/builds
GET    /api/me/builds/:buildId
PATCH  /api/me/builds/:buildId
DELETE /api/me/builds/:buildId
```

Damage endpoint:

```text
POST /api/damage/calculate
```

The damage endpoint may remain public for manual calculations.

When `bossId` is present, the backend must load the matching boss combat values
for the configured game version. Clients must not supply authoritative boss
defense or absorption values. Omitting `bossId` returns boss-independent
offensive output without a final damage claim.

Normal weapon calculations use a validated `attackId`. The backend resolves
motion values and physical attack type from imported Regulation attack data;
normal weapon requests must not accept those technical values as authoritative
client input. User-facing attack labels require a verified mapping between the
player animation and its Regulation behavior. Verified core movesets are shared
by imported weapons through their motion category; ambiguous jump, critical,
mounted, and special behaviors stay excluded until separately verified.
When a weapon-specific `behaviorVariationId` contains a direct override for a
verified attack, that override takes precedence over the class-level fallback.
Projectile, spell, perfume, and other non-direct attacks require their own
component mapper and must not be forced through the direct melee pipeline.

Verified weapon skills are stored with their individual weapon-hit and
projectile components. Public weapon responses expose skill and attack IDs,
names, and FP costs, but not internal Regulation source IDs. Weapon damage
requests must contain exactly one of `attackId` or `skillAttackId`; the backend
resolves the selected attack only within the selected weapon.

Skill definitions declare their components explicitly. The mapper must support
pure weapon-hit, pure projectile, and mixed attacks without inserting empty
placeholder components. Square Off, Lion's Claw, Impaling Thrust, Piercing
Fang, both Stamp variants, Giant Hunt, and Prayerful Strike are verified
weapon-hit cases; Flame
of the Redmanes is the projectile case, and Transient Moonlight covers the
mixed form. Charge Forth verifies full and early-release sequences; Unsheathe
verifies stance follow-ups with separate FP costs. Prayerful Strike uses
`BehaviorParam_PC` 300000102 and `AtkParam_Pc` 301200820 with a 235 motion value
and 20 FP cost. Its healing is outside the stateless damage calculation and
must not be inferred as calculated healing. Its skill variants must preserve
the inherited physical attack type for axe, greataxe, hammer, great-hammer,
flail, and colossal-weapon selections.

The public Ash-of-War catalog uses `EquipParamGem` playable rows, not their
broad template rows. Compatibility comes from verified `canMountWep_*` flags.
`GET /api/ashes-of-war` always returns an array and may filter by `weaponType`;
`GET /api/ashes-of-war/:ashOfWarId` returns one-element or empty data arrays.
Catalog entries use `supported` or `catalog-only` calculation status. The list
may also filter by affinity and calculation status. `catalog-only` entries must
never be accepted by the damage endpoint.

Catalog Ash-of-War damage requests include `weaponId`, `ashOfWarId`, and
`skillAttackId`. The backend resolves the weapon's normalized motion type and
must reject incompatible combinations before calculation. Fixed weapon skills
continue to use `weaponId` plus `skillAttackId` without `ashOfWarId`.

All weapon damage requests distinguish canonical `weaponId` from calculation
`weaponVariantId`. Resolve attacks and skills through the canonical weapon, but
attack rating through the selected variant. Verify that the variant belongs to
the weapon and use its affinity when checking Ash-of-War damage and buff
compatibility. Never accept a free-standing variant as authoritative.

Ashes whose motion values differ by weapon class use explicit skill variants.
The repository selects a variant from the persisted weapon type; clients never
submit an internal variant identifier. Wild Strikes is the verified reference
case. Do not reuse one reference weapon's profile across incompatible classes.

The completed MVP Ash-of-War calculation set is: Square Off, Flame of the
Redmanes, Lion's Claw, Impaling Thrust, Piercing Fang, Stamp (Upward Cut), Stamp
(Sweep), Giant Hunt, Wild Strikes, Charge Forth, Unsheathe, Prayerful Strike,
and Thunderbolt. Treat this as
the canonical supported list. All other catalog Ashes remain `catalog-only`
until their complete behavior chain is explicitly verified. Transient Moonlight
is a fixed weapon skill and does not belong to this list.

Thunderbolt is the verified pure-projectile reference for BehaviorParam_PC
300000350, Bullet 2080, and AtkParam_Pc 301600840. Preserve its 120 added
lightning damage and 10 FP cost; do not add an unverified weapon-hit component.

Buff-only Ashes use a typed `buffEffect` rather than fake damage components.
The verified initial set is Sacred Blade, Flaming Strike, Lightning Slash,
Determination, Royal Knight's Resolve, Seppuku, and Cragblade. Apply attack-
power multipliers and flat added damage before motion values, and outgoing
multipliers afterward. Determination and Royal Knight's Resolve are next-hit
effects. Preserve added status buildup, poise-damage modifiers, duration, and
limitations. A spell weapon buff and an Ash weapon buff cannot be active on the
same weapon simultaneously.

---

# Damage Domain Logic

Damage calculations are implemented as backend domain logic.

Do not delegate core calculations to the frontend.

Important functions may include:

```text
calculateAttackRating()
calculateAttributeScaling()
calculateDefenseReduction()
calculateAbsorption()
calculateHitDamage()
```

Domain functions should be pure where possible.

They must not depend directly on:
- Express
- Mongoose
- Clerk

This keeps them deterministic and testable.

---

# Damage Calculation Pipeline

Initial target pipeline:

```text
Weapon Data
  -> Reinforcement
  -> Attribute Scaling
  -> Attack Rating per Damage Type
  -> Attack / Motion Modifier where required
  -> Target Defense
  -> Target Absorption
  -> Estimated Damage Per Hit
```

Initial damage types:

- physical
- magic
- fire
- lightning
- holy

---

# Damage Scope

MVP supports direct weapon hit damage and selected, regulation-verified Ashes
of War. A skill may contain multiple damage components such as a weapon hit and
a projectile. Each component must retain its own motion values, added damage,
physical attack type, and final damage rates.

Not required for MVP:

- DPS
- complete combo simulation
- status-effect proc damage
- bleed proc damage
- poison and other status proc damage
- frost proc damage
- full buff systems
- damage for `catalog-only` spells
- complete Ash-of-War and fixed weapon-skill calculation coverage
- PvP-specific calculations
- complete talisman modifier support

Unsupported mechanics must be documented rather than silently approximated.

---

# Damage Accuracy

The project should distinguish between:

- exact game-derived values
- calculated values
- approximations

Calculation formulas should be documented.

Known limitations must be explicit.

---

# Error Handling

Use centralized error handling.

Expected status codes include:

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

Do not expose stack traces or sensitive implementation details to clients.

Use a consistent API error structure.

---

# Logging

Log meaningful application failures.

Do not leave unnecessary development logs in production code.

Never log:
- secrets
- Clerk tokens
- authentication headers
- sensitive user data

---

# Configuration

Use environment variables.

Examples:

```text
DATABASE_URL
CLERK_SECRET_KEY
PORT
```

Never commit secrets.

Validate required environment values during startup.

---

# Security

Security requirements:

- validate all input
- authenticate protected routes
- enforce ownership server-side
- never trust user IDs from the client for ownership
- prevent private builds from being exposed publicly
- protect environment secrets
- avoid leaking internal errors
- safely handle user-generated text

---

# Testing

Backend test stack:

- Vitest
- Supertest

Testing priority:

1. damage calculation domain logic
2. ownership and authorization
3. build validation
4. protected build CRUD
5. game-data mapping
6. important public API endpoints

Damage calculations should be deterministic and tested against known reference values where possible.

Database-backed API tests must verify that an `attackId` belongs to the selected
weapon, weapon-specific behavior overrides are used, boss-independent and
boss-specific responses remain distinct, and unsupported weapons expose an
empty `attacks` array.

---

# Naming

Use descriptive English names.

Examples:

```text
calculateDamage.ts
build.service.ts
build.controller.ts
build.schema.ts
```

Avoid unclear abbreviations.

---

# Dependency Rules

Do not introduce dependencies for functionality already handled clearly by the existing stack.

Before adding a package, evaluate:
- necessity
- maintenance
- scope impact
- overlap with existing packages

---

# Refactoring Rules

Do not refactor unrelated functionality while implementing a feature.

Prefer incremental improvements.

Do not introduce patterns solely for theoretical correctness.

---

# Completion Criteria

A backend feature is not finished when the happy path works.

Consider:

- validation
- authentication
- authorization
- ownership
- expected errors
- consistent responses
- tests
- data mapping
- security
- maintainability

For user-owned resources, protected-route and ownership tests are part of the definition of done.

---

# Agent Instructions

Before modifying the backend:

1. Inspect the responsible feature.
2. Follow the existing feature-based architecture.
3. Identify the correct responsibility layer.
4. Validate all external input.
5. Treat user-owned endpoints as protected by default.
6. Enforce ownership server-side.
7. Never accept client-controlled ownership as authoritative.
8. Keep regulation and ERDB structures behind the import and mapping boundary.
9. Add or update tests for business-critical logic.
10. Avoid modifying unrelated features.

Build stats accepts up to ten unique spell IDs. Validate them against the
active Regulation version and return catalog metadata. Available memory slots
are two base slots plus zero to eight submitted Memory Stones and supported
talisman bonuses. Reject selections exceeding that capacity. This endpoint does
not calculate FP consumption or spell damage; verified spell profiles use the
damage endpoint. Validate Intelligence, Faith, and
Arcane requirements against effective stats after supported equipment bonuses.

Identify catalysts only through `EquipParamWeapon.enableMagic` and
`enableMiracle`. Catalyst scaling uses the existing weapon reinforcement,
attribute-correction, and correction-curve data with base value 100. Preserve
scaling per damage type; do not choose a single spell scaling value until a
verified spell attack component supplies its damage type.

Build stats accepts an optional catalyst selection containing canonical weapon
ID, calculation-variant ID, and upgrade level. Verify variant ownership,
supported casting types, upgrade bounds, and effective attribute requirements.
Return Regulation-derived scaling for all five damage types.

Spell damage uses verified direct, area, spread, channelled, multi-projectile,
and multi-component profiles. Resolve
Magic primary bullet references to Bullet and AtkParam_Pc, treat the attack's
per-type attack values as spell motion values, and apply FinalDamageRateParam.
The canonical current total is 34 supported spells and 137 `catalog-only`
spells. Only profiles produced by the verified mapper may become `supported`;
all others remain `catalog-only`.

Glintstone Icecrag and Gravity Well are supported direct projectiles. Preserve
per-hit status buildup separately from damage: Icecrag exposes 100 frost from
its Bullet-linked SpEffect, while Gravity Well's pull effect is documented but
must not be represented as damage or status buildup. Never infer a status proc
without target resistance and accumulated combat state.

Verified direct incantation profiles are mapped in homogeneous groups rather
than through spell-specific services. Flame Sling, Wrath of Gold, and Frenzied
Burst expose separate normal and charged profiles. Discus of Light and
Lightning Spear currently expose their verified normal per-hit profiles.
Frenzied Burst preserves 90/105 madness buildup for normal/charged hits. Do not
mark a charged or chained profile supported when its primary Regulation attack
only forwards to unresolved child behavior.

Multi-projectile profiles expose verified per-hit values, not a guessed total.
This applies to Glintblade Phalanx, Carian Phalanx, Greatblade Phalanx,
Collapsing Stars, Bestial Sling, and Pest Threads. Collapsing Stars has equal
normal/charged per-projectile motion values; charging may still affect behavior
outside raw per-hit damage. Total cast damage requires authoritative hit counts
and must not assume every projectile or repeated hit connects.

Channeled spell profiles use `outputUnit: per-tick` and preserve their ongoing
FP cost separately from charged FP cost. Crystal Barrage, Comet Azur, and
Crystal Torrent expose verified per-tick motion values. Do not infer total
channel damage, duration, tick count, or total FP consumption without an
explicit channel-duration model.

Explosion profiles must resolve the actual damaging Bullet. Cannon of Haima
and Giantsflame Take Thee use their root Bullet's `HitBulletID`; the root attack
is only a delivery/trigger record and must not be reported as spell damage.
Greyoll's Roar has a directly damaging area profile. Follow hit bullets only
for explicitly verified chains rather than assuming every `HitBulletID` is the
sole damage component.

Spread and wave attacks with verified normal/charged bullets expose per-
projectile values. Crystal Burst, Scouring Black Flame, Beast Claw, and The
Flame of Frenzy belong to this group. Preserve Frenzy's 21/28 madness buildup
for normal/charged projectiles. Do not multiply by emitted projectile count or
assume all projectiles connect.

Verified multi-component spell profiles preserve each damaging phase with its
own ID, label, output unit, motion values, and status buildup. Magma Shot,
Roiling Magma, and Explosive Ghostflame use this model. The aggregate output may
sum exactly one occurrence of each component only when it is labeled with
`aggregateAssumption: one-occurrence-per-component`; it is not total cast
damage. Multi-component responses expose status per component and set the
top-level status buildup to null.

Spell buffs use mutually exclusive `aura`, `body`, and `weapon` slots. Golden
Vow and Flame Grant Me Strength may stack because they occupy different slots;
apply their PvE outgoing multipliers after attack rating and before defense.
Route build validation and both damage paths through the shared buff-domain
rules so slot exclusivity and per-type multiplier composition cannot drift.
Preserve request order in response metadata. A build may store both a spell
weapon buff and an Ash of War, but one damage request must never activate both
weapon-buff sources simultaneously.
Weapon buffs require a separate verified catalyst selection and a target weapon
proven buffable from `EquipParamWeapon.isEnhance`. Add the selected catalyst's
per-damage-type scaling multiplied by the Regulation coefficient to weapon
attack rating before attack motion values. Never apply a weapon enchantment to
an ineligible weapon.

The verified offensive buff set also includes Order's Blade, Vyke's Dragonbolt,
and Howl of Shabriri. Preserve their anti-undead, equip-load, and incoming-damage
behaviors as explicit limitations until the corresponding combat-state and
player-defense calculations exist; do not silently treat partial support as a
complete simulation.

Frozen Armament and Poison Armament resolve their flat per-hit buildup through
`SpEffectParam.atkOccurrenceSpEffectId`. Expose 63 frost and 70 poison as added
status buildup on the selected weapon buff. Do not calculate a status proc or
merge it into direct damage without target resistance and accumulated combat
state.

Repeated Bullet chains must be normalized to distinct damage profiles rather
than duplicating the same attack row for every emitted Bullet. Shattering
Crystal and the Ancient Dragon lightning spear spells use this rule. Preserve
each distinct per-hit phase, but do not infer how many repeated waves connect.
Smithbox's internal `Light Spear` row names for Magic IDs 6940/6941 must be
normalized to the player-facing `Lightning Spear` names.

Spell damage requests accept up to four supported talisman IDs. Apply permanent
attribute bonuses before catalyst scaling. Then multiply per damage type by
general outgoing-damage modifiers, the matching sorcery or incantation
multiplier, and—only for `charged: true`—the charged-spell multiplier. Do not
activate HP-, event-, or other combat-state conditions without explicit
authoritative state. Preserve request order and reject unsupported records.

If a requested implementation conflicts with this document or `spec.md`, explicitly identify the conflict before changing the architecture.
