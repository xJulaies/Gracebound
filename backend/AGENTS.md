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
```

The client must not choose the owner.

On creation, the backend assigns:

```text
ownerId = authenticatedUserId
```

Do not accept an `ownerId` from the request body.

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

GET /api/bosses
GET /api/bosses/:bossId
```

The talisman catalog uses named base-game `EquipParamAccessory` rows below ID
7000. Regulation 1.17.0 must map exactly 116 entries. IDs 7000 and above require
a separate complete Shadow of the Erdtree import. Store the internal
accessory and effect IDs for later mapping, but expose only normalized selection
data. Talisman effects remain `catalog-only` until their complete conditions and
modifiers are verified from `SpEffectParam`; never infer support from the
talisman name alone.

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
Fang, both Stamp variants, and Giant Hunt are verified weapon-hit cases; Flame
of the Redmanes is the projectile case, and Transient Moonlight covers the
mixed form. Charge Forth verifies full and early-release sequences; Unsheathe
verifies stance follow-ups with separate FP costs.

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

Ashes whose motion values differ by weapon class use explicit skill variants.
The repository selects a variant from the persisted weapon type; clients never
submit an internal variant identifier. Wild Strikes is the verified reference
case. Do not reuse one reference weapon's profile across incompatible classes.

The completed MVP Ash-of-War calculation set is: Square Off, Flame of the
Redmanes, Lion's Claw, Impaling Thrust, Piercing Fang, Stamp (Upward Cut), Stamp
(Sweep), Giant Hunt, Wild Strikes, Charge Forth, and Unsheathe. Treat this as
the canonical supported list. All other catalog Ashes remain `catalog-only`
until their complete behavior chain is explicitly verified. Transient Moonlight
is a fixed weapon skill and does not belong to this list.

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
- poison
- frost proc damage
- full buff systems
- spell damage
- a complete Ash of War catalog
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

If a requested implementation conflicts with this document or `spec.md`, explicitly identify the conflict before changing the architecture.
