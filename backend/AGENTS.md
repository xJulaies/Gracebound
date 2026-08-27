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
