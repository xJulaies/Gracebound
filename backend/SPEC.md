# Elden Ring Companion — Backend Specification

Version: 0.4

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

The regulation-derived catalog currently normalizes 460 canonical player
armaments and 3,112 calculation variants from game version 1.16.1. Affinity
variants are grouped under their canonical weapon. The import validates every
variant by calculating its maximum-level attack rating with valid attributes
before the dataset is eligible for persistence.

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
- description or effect
- relevant effect metadata where available

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

The MVP contains ten curated boss encounters. The exact ten bosses and their
raw values remain a pending product decision. Different locations or phases
must be separate records when their combat values differ.

Boss raw data follows the same boundary as ERDB data:

```text
versioned curated source
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

---

# Damage Response

Conceptual example:

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

Without a boss, `damage` is omitted and the response represents offensive
output. With a boss, `damage` contains per-component and combined estimates.
The final field structure may evolve as calculation research is validated.

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

# Out of Scope for Initial Damage MVP

Not required:

- DPS
- full combo simulation
- bleed proc damage
- poison
- frost proc damage
- complete status-effect system
- full buff system
- PvP-specific calculations
- spell damage
- complete Ash of War coverage
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

Initial public resource areas:

```text
/api/weapons
/api/armor
/api/talismans
/api/bosses
/api/builds
/api/damage
```

Protected authenticated-user area:

```text
/api/me/builds
```

API design should remain resource-oriented.

---

# Pagination, Search, Filtering, and Sorting

Compendium endpoints should support relevant combinations of:

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

1. final response field structure for boss-independent and boss-specific results
2. verified calculation order for added skill damage and final-damage rates
3. user-facing labels for regulation behavior and attack identifiers
4. which talisman and equipment effects are supported by the MVP calculator
5. exact deployment platform

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
