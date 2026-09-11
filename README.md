# Gracebound

Gracebound is an unofficial Elden Ring companion for exploring game data, planning character builds, and estimating damage. The project focuses on the information needed for build decisions instead of trying to reproduce a complete game wiki.

> Gracebound is a non-commercial portfolio project and is not affiliated with or endorsed by FromSoftware or Bandai Namco Entertainment.

## Current state

Gracebound now provides the complete portfolio flow from Regulation-backed
catalog exploration through authenticated build creation and an interactive,
phase-aware boss damage trial. Remaining gaps are explicit game-mechanic
coverage gaps rather than missing application architecture.

### Available today

- searchable catalog APIs for weapons, armor, talismans, sorceries, incantations, Ashes of War, bosses, character classes, Great Runes, and Crystal Tears
- normalized Elden Ring Regulation data for game version `1.17.0`
- weapon attack-rating and build-stat calculations
- estimated damage calculations with optional boss defense and absorption
- supported damage and buff profiles for selected spells, skills, equipment effects, Great Runes, and Wondrous Physick tears
- public builds and authenticated, user-owned build CRUD through Clerk
- WebP icon and character-class image delivery from MongoDB
- versioned Elden Ring menu frames and category symbols for the build editor
- English summaries and item descriptions imported from the game text files
- a responsive public frontend layout with Grace and Night themes
- a responsive landing-page hero and animated character-class carousel
- a builds overview with public build cards and a Clerk-aware creation entry point
- a complete authenticated build editor with six weapon slots, armor,
  talismans, spells, catalyst, Great Rune, Crystal Tears, and buff selections
- owned-build editing, duplication, deletion, visibility control, and public
  build details
- an authenticated Damage Trial with effect toggles, phase transitions, sticky
  mobile boss status, action history, undo, and reset

The active `1.17.0` dataset contains 487 weapons, 586 armor pieces, 116
talismans, 171 spells, 116 Ashes of War, 177 boss combat profiles, seven Great
Runes, and 32 Crystal Tears. Calculation coverage is explicit: 45 spells, 29
Ashes, 114 talismans, three Great Runes, and 22 Crystal Tears are supported;
the remaining entries stay catalog-only. Gracebound does not claim complete
DPS, PvP, status-proc, DLC, or every exceptional Elden Ring mechanic.

## Architecture

Gracebound is one Git repository containing two independent npm projects:

```text
Gracebound/
  backend/    Express REST API, domain logic, imports, and MongoDB persistence
  frontend/   React application
```

There is no npm workspace or monorepo build tool. Install and run each project separately.

The backend follows a feature-based controller/service/repository structure. The frontend combines feature-based ownership with Atomic Design folders (`atoms`, `molecules`, and `organisms`) inside each feature. Both sides favor explicit, readable code and follow KISS and YAGNI.

### Technology

| Frontend | Backend |
| --- | --- |
| React 19, TypeScript, Vite | Node.js, Express 5, TypeScript |
| TanStack Router and Query | MongoDB and Mongoose |
| Tailwind CSS and Zod validation | Zod validation |
| Clerk | Clerk |
| Vitest and React Testing Library | Vitest, Supertest, MongoDB Memory Server |

## Requirements

- Node.js 22 or newer
- npm
- a MongoDB Atlas database or another compatible replica-set deployment
- a Clerk application for authentication

## Local setup

Install both applications:

```powershell
cd backend
npm install
Copy-Item .env.template .env

cd ..\frontend
npm install
Copy-Item .env.template .env
```

Configure `backend/.env`:

```dotenv
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>/gracebound?retryWrites=true&w=majority
CLERK_PUBLISHABLE_KEY=<your-publishable-key>
CLERK_SECRET_KEY=<your-secret-key>
MAX_BUILDS_PER_USER=100
SUPPORTED_GAME_VERSION=1.17.0
```

Configure `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=<your-publishable-key>
```

Never commit real credentials. The templates contain variable names only.

Start the applications in separate terminals:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

The frontend is then available at `http://localhost:5173`; the API runs at `http://localhost:3000/api` by default.

### Production and Lighthouse builds

The normal frontend production build fails closed unless `VITE_API_URL` is an
explicit HTTPS URL and `VITE_CLERK_PUBLISHABLE_KEY` is a `pk_live_` key. The
backend likewise requires `pk_live_` and `sk_live_` Clerk keys, an HTTPS CORS
origin, and encrypted MongoDB transport when `NODE_ENV=production`.

For an optimized local Lighthouse build with localhost and Clerk development
keys, use the deliberately non-deployable Lighthouse mode:

```powershell
cd frontend
npm run build:lighthouse
npm run preview:lighthouse
```

Vite development and preview responses apply the base document headers defined
in `frontend/src/shared/config/securityHeaders.ts`. The production frontend
host must apply the same headers at the edge. Before public deployment, extend
the CSP fetch directives with the exact production Clerk and API origins and
enable HSTS on the HTTPS host; these values depend on the selected hosting and
Clerk domains and must not be guessed in application code.

## API overview

Public routes expose catalogs and individual records for the supported game-data domains, plus health, public builds, calculations, and binary assets. Authenticated `/api/me/builds` routes manage the signed-in user's builds.

Build collections use `page` and `limit` query parameters (24 and 100 by
default/maximum) and return the matching total in `X-Total-Count`. Owned build
collections additionally accept `visibility=public|private`. The per-user build
quota is configured with `MAX_BUILDS_PER_USER` and defaults to 100.

JSON endpoints use a consistent envelope:

```json
{
  "status": 200,
  "message": "Request completed",
  "data": []
}
```

`data` is always an array, including single-resource and empty responses. Binary asset routes are the deliberate exception.

## Game data and assets

Smithbox exports from a local `regulation.bin` are the sole source for versioned game data. Import scripts validate and normalize those exports before writing to MongoDB.

Useful backend commands include:

```powershell
npm run data:compare:regulation
npm run data:import:regulation
npm run data:import:bosses
npm run data:import:armor
npm run data:import:talismans
npm run data:import:spells
npm run data:import:great-runes
npm run data:import:crystal-tears
npm run data:import:classes
```

Game icons and class images are converted to storage-efficient WebP assets and stored in MongoDB. Raw Regulation exports, extracted game files, source screenshots, credentials, and imported binary assets do not belong in Git.

English item descriptions are imported separately from a Smithbox Text Editor JSON export. The text importer only enriches matching records in the existing versioned base-game catalogs and does not create content from raw FMG entries.

More detailed import and domain rules live in [backend/AGENTS.md](backend/AGENTS.md) and [backend/SPEC.md](backend/SPEC.md).

## Quality checks

Run checks inside both `frontend` and `backend` directories:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Backend integration tests use MongoDB Memory Server, so they do not write test data to the configured development or Atlas database.

Repository-verifiable behavior is covered by backend and frontend typechecking,
linting, unit/integration tests, and production builds. Frontend runtime
boundaries now use feature-owned Zod schemas for form data, URL state,
environment input, outbound payloads, and API responses. One known form contract
gap remains: the build editor's persisted state still uses manual React state
instead of the required TanStack Form integration.
Catalog-only mechanics are an explicit support boundary rather than silently
approximated behavior. Release verification must additionally cover real-browser
responsive and keyboard interaction plus deployment-owned HTTPS and security
headers, because repository tests cannot prove those conditions.

## Documentation

- [Frontend implementation rules](frontend/AGENTS.md)
- [Frontend product specification](frontend/SPEC.md)
- [Backend implementation rules](backend/AGENTS.md)
- [Backend product specification](backend/SPEC.md)

## Verified boundaries

- Runtime game data comes exclusively from normalized Regulation imports in
  MongoDB; no secondary game-data service is used.
- Ownership, catalog compatibility, game version, and damage inputs are
  validated by the backend. Private builds are never returned by public routes.
- Damage Trial history and calculated results are transient and are not
  persisted. Private visibility remains the build default.
- Responsive layouts are mobile-first and progressively enhanced for wider
  screens. Interactive overlays and navigation follow the documented keyboard
  and focus contracts.

Potential future work includes broader verified Ash-of-War and spell coverage,
DLC data after local source validation, richer status-state simulation, and
optional social features. These are outside the current supported contract.
