# Elden Ring Companion — Backend Specification

Version: 0.2

---

# Purpose

The backend provides the REST API and domain logic for the Elden Ring Companion application.

Primary responsibilities:

- expose normalized Elden Ring game data
- manage user-owned builds
- integrate Clerk authentication
- enforce authorization and ownership
- import and normalize ERDB-derived data
- calculate attack rating
- calculate estimated damage per hit
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
6. ERDB-derived data import
7. domain models
8. damage-calculation logic

The frontend must never be treated as a security boundary.

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

ERDB is the single primary source of Elden Ring game data.

No secondary fan API should be used as part of the normal application architecture unless the project specification is deliberately changed.

ERDB is used as a game-data ingestion and normalization source.

The frontend never communicates directly with ERDB.

---

# Game Data Strategy

Preferred pipeline:

```text
ERDB-derived data
  -> Import
  -> Validation
  -> Transformation
  -> Application domain models
  -> Application game-data storage
  -> REST API
```

The backend should not expose ERDB response structures directly.

The application should remain independent from ERDB schema details.

---

# Game Data Import

A dedicated import process transforms source game data into application-specific models.

Requirements:

- repeatable import
- explicit validation
- explicit mapping
- stable application identifiers where possible
- documented supported game version
- no need for live ERDB access on every request

Game data is treated as read-only during normal application usage.

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

Exact implementation depends on validated ERDB-derived data.

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
- armor
- talismans

Additional slots may be introduced if required.

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

# Damage API

Initial endpoint:

```text
POST /api/damage/calculate
```

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
  "targetId": "malenia"
}
```

Additional attack information may be added if required by the finalized hit-damage model.

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

The final response contract may evolve as calculation research is validated.

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
- Ash of War damage
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

The following implementation details remain to be validated during ERDB integration:

1. exact ERDB export/import path
2. final normalized weapon model
3. final boss defensive model
4. exact reinforcement data mapping
5. exact scaling-curve mapping
6. final damage formula implementation
7. attack or motion-value handling for MVP
8. game-version metadata strategy
9. exact deployment platform

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
- provide build CRUD
- provide a working damage-per-hit endpoint
- contain deterministic domain tests
- contain authorization tests
- validate external input
- follow the documented architecture
