# Elden Ring Companion — Frontend Specification

Version: 0.2

---

# Project Vision

Build a modern Elden Ring companion web application that combines structured game information with interactive build-planning and damage-calculation tools.

The application should demonstrate modern frontend development skills while remaining a coherent and useful product.

The project is not intended to become a complete Elden Ring wiki.

Its primary product pillars are:

1. Compendium
2. Build Planner
3. Damage Calculator
4. Public and Private User Builds

---

# Project Structure

The project lives inside a single Git repository with two independent npm projects.

```text
elden-ring-companion/
  frontend/
  backend/
```

The frontend has its own:
- `package.json`
- `package-lock.json`
- dependencies
- `agents.md`
- `spec.md`

No npm workspaces, Nx, or Turborepo are required.

---

# Tech Stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- TanStack Form
- Zod
- Tailwind CSS
- HeroUI
- Clerk
- Vitest
- React Testing Library
- npm

---

# Product Goals

Users should be able to:

- browse Elden Ring game data
- search, filter, and sort equipment
- inspect weapon details
- inspect boss details
- create character builds
- configure character stats
- select equipment
- save builds
- mark builds public or private
- view public builds
- calculate estimated weapon damage per hit against selected targets

---

# Target Users

Primary users are Elden Ring players who want to:

- research equipment
- plan builds
- compare weapons
- understand expected damage output
- save configurations
- share builds

---

# Core Navigation

Initial navigation:

```text
Home

Compendium
  Weapons
  Armor
  Talismans
  Bosses

Builds
  Public Builds
  My Builds
  Create Build

Damage Calculator

Account
```

---

# Data Source Boundary

The frontend does not communicate directly with ERDB.

The frontend consumes only the application's own backend REST API.

```text
Frontend
  -> Backend API
  -> Application domain layer
  -> ERDB-derived game data
```

ERDB-specific structures must not leak into frontend feature code.

---

# MVP

## Compendium

The MVP contains:

- Weapons
- Armor
- Talismans
- Bosses

Each category should provide:

- overview page
- search
- filtering
- sorting where useful
- pagination where useful
- detail page

---

# Weapons

Weapon overview should display relevant information such as:

- name
- weapon type
- attack values
- attribute requirements
- scaling
- weight

Weapon detail may include:

- base attack information
- damage types
- attribute requirements
- attribute scaling
- reinforcement information
- information required by the damage calculator

Exact fields depend on the normalized backend domain model.

---

# Armor

Armor overview may provide:

- name
- armor category
- weight
- defensive values

Armor detail should display the most relevant game-derived information available through the backend domain model.

---

# Talismans

Talisman overview should provide:

- name
- description or effect summary
- relevant effect information

Talisman damage modifiers are not required for the initial damage-calculator MVP.

---

# Bosses

Boss overview should provide:

- name
- search
- relevant filters

Boss detail may include:

- name
- location
- health information
- defensive values
- absorption or resistance values
- related information available from the backend

Boss defensive values should be usable by the Damage Calculator where supported by the imported ERDB-derived dataset.

---

# Authentication

Authentication is handled with Clerk.

Anonymous users may:

- browse the compendium
- view public builds
- use the public damage calculator

Authenticated users may additionally:

- create builds
- view their private builds
- edit their own builds
- delete their own builds
- change build visibility

The frontend must attach the Clerk authentication token to protected backend requests.

The backend is the final authority for authentication and ownership.

---

# Protected User Routes

Frontend pages that work with the authenticated user's private data should use backend routes under:

```text
/api/me/*
```

Examples:

```text
GET    /api/me/builds
POST   /api/me/builds
GET    /api/me/builds/:buildId
PATCH  /api/me/builds/:buildId
DELETE /api/me/builds/:buildId
```

The frontend must not send or choose a user ID to determine ownership.

---

# Build Planner

Authenticated users can create builds.

A build contains at minimum:

- name
- description
- character level
- character attributes
- primary weapon
- weapon upgrade level
- armor
- talismans
- visibility

Potential character stats:

- Vigor
- Mind
- Endurance
- Strength
- Dexterity
- Intelligence
- Faith
- Arcane

Build inputs must be validated with Zod.

---

# Build Management

Authenticated users can:

- create builds
- view their own builds
- edit their own builds
- delete their own builds
- mark builds public
- mark builds private

Anonymous and authenticated users may view public builds.

Private builds must never be exposed through public build endpoints.

---

# Public Builds

Public builds should support:

- overview
- detail page
- build owner display where appropriate
- selected equipment
- stats
- build description

Ratings, comments, and social features are stretch goals.

---

# Damage Calculator

The Damage Calculator is one of the primary technical features of the application.

Anonymous users may use the calculator with manually selected values.

Authenticated users may additionally load data from one of their saved builds.

Users should be able to select:

- character stats or an existing owned build
- weapon
- weapon upgrade level
- target enemy or boss
- supported attack type if required by the MVP calculation

The backend performs the actual damage calculation.

The frontend displays the result.

---

# Damage Result

The UI should support displaying values such as:

```text
Attack Rating
  Physical
  Magic
  Fire
  Lightning
  Holy
  Total

Estimated Damage Per Hit
  Physical
  Magic
  Fire
  Lightning
  Holy
  Total
```

The exact result shape follows the backend API contract.

The UI should clearly distinguish:
- source game data
- calculated values
- approximations where applicable

---

# Damage Calculation Scope

The frontend should support the MVP calculation pipeline:

```text
Weapon
+ Upgrade Level
+ Character Attributes
-> Attack Rating
-> Target Defense
-> Target Absorption
-> Estimated Damage Per Hit
```

Not required for MVP:

- DPS
- complete combo simulation
- bleed proc calculations
- poison damage
- frost proc damage
- complete buff systems
- PvP-specific calculations
- spell damage
- Ash of War damage
- full talisman modifier support

---

# Search, Filtering, Sorting, and Pagination

Search and filter state should be reflected in URL search parameters where practical.

Example:

```text
/compendium/weapons?type=katana&sort=damage&page=2
```

Benefits:
- shareable URLs
- browser navigation
- persistent filter state

---

# Server State

TanStack Query manages API state.

All asynchronous resources should consider:

- loading state
- error state
- empty state
- success state

Protected queries must also handle unauthenticated and forbidden states.

---

# Forms

Use TanStack Form and Zod for complex forms.

Primary forms include:

- build creation
- build editing
- damage calculator configuration where appropriate

---

# State Management

Do not introduce Redux or Zustand by default.

Use:
- TanStack Query for server state
- TanStack Router for URL state
- TanStack Form for form state
- React state for local UI state

---

# Architecture

Primary frontend architecture:

```text
src/
  features/
    auth/
    compendium/
    weapons/
    armor/
    talismans/
    bosses/
    builds/
    damage-calculator/

  shared/
    ui/
    hooks/
    api/
    utils/
    types/

  routes/
```

Feature-based architecture is the core organizational model.

Atomic Design may be used inside features where useful but is not mandatory for every component.

---

# Design Direction

The interface should feel:

- dark
- elegant
- medieval
- atmospheric
- modern
- readable

The application may be inspired by Elden Ring's atmosphere without directly reproducing the game's interface.

Usability is more important than visual imitation.

---

# Responsive Design

Desktop is the primary design target.

The application must remain usable on:

- tablet
- mobile

Tables may transform into responsive card layouts.

---

# Accessibility

Requirements include:

- semantic HTML
- keyboard navigation
- labeled inputs
- visible focus states
- readable contrast
- correct button and link semantics

---

# Testing

Frontend test stack:

- Vitest
- React Testing Library

Priorities:

1. important feature interactions
2. protected UI flows
3. form validation behavior
4. meaningful component behavior
5. utility functions

The mathematical damage engine is tested in the backend.

---

# Out of Scope for MVP

Not required initially:

- comments
- ratings
- build voting
- social following
- guides
- quest database
- NPC database
- full interactive world map
- multiplayer tools
- PvP simulation
- DPS simulation
- full status-effect simulation
- full buff system
- spell damage
- Ash of War damage
- complete Elden Ring mechanic coverage

---

# Stretch Goals

Possible stretch goals:

- favorite builds
- build ratings
- build sharing
- spells
- incantations
- Ashes of War
- weapon comparison
- stat optimization
- multiple weapon damage comparison
- shareable build cards
- advanced modifiers
- additional compendium categories

---

# Definition of Done

The final frontend should:

- be buildable for production
- communicate with the backend API
- support Clerk authentication
- correctly use protected backend routes
- provide responsive layouts
- provide loading and error states
- provide working build CRUD for authenticated users
- prevent access to private build UI where appropriate
- provide usable game-data exploration
- provide a working damage-per-hit interface
- follow the documented architecture
- pass relevant tests
