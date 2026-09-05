# Gracebound

Gracebound is an unofficial Elden Ring companion for exploring game data, planning character builds, and estimating damage. The project focuses on the information needed for build decisions instead of trying to reproduce a complete game wiki.

> Gracebound is a non-commercial portfolio project and is not affiliated with or endorsed by FromSoftware or Bandai Namco Entertainment.

## Current state

The backend already contains the main data and calculation foundation. The frontend is in active development and currently establishes the public experience and the beginning of the build flow.

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
- an authenticated `/builds/new` flow that starts with character-class selection

Some catalog entries are intentionally marked as catalog-only until their individual combat behavior has been verified. Gracebound does not currently promise complete DPS, PvP, status-proc, or every possible Elden Ring mechanic.

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
| Tailwind CSS | Zod validation |
| Clerk | Clerk |
| Vitest and React Testing Library | Vitest, Supertest, MongoDB Memory Server |

## Requirements

- Node.js 22 or newer
- npm
- a MongoDB Atlas database or another compatible replica-set deployment
- a Clerk application for authentication
- Docker Desktop only when using the optional local ERDB fallback

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
SUPPORTED_GAME_VERSION=1.17.0
ERDB_BASE_URL=http://127.0.0.1:8107/v1
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

## API overview

Public routes expose catalogs and individual records for the supported game-data domains, plus health, public builds, calculations, and binary assets. Authenticated `/api/me/builds` routes manage the signed-in user's builds.

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

Smithbox exports from a local `regulation.bin` are the primary source for versioned game data. Import scripts validate and normalize those exports before writing to MongoDB. ERDB remains an optional comparison and fallback source for weapon data; it is not required to run the application.

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

## Documentation

- [Frontend implementation rules](frontend/AGENTS.md)
- [Frontend product specification](frontend/SPEC.md)
- [Backend implementation rules](backend/AGENTS.md)
- [Backend product specification](backend/SPEC.md)
- [Local ERDB fallback](backend/src/infrastructure/erdb/README.md)

## Next priorities

- build the responsive loadout editor with desktop equipment regions and task-focused mobile tabs
- add slot pickers for weapons, armor, talismans, spells, buffs, Great Runes, and Crystal Tears
- connect selection steps for equipment, attributes, buffs, and bosses to the existing APIs
- keep client-side previews responsive while treating backend calculations as authoritative
- expand verified spell, skill, weapon, and equipment behavior only where it materially improves build planning
