# Elden Ring Companion — Frontend Specification

Version: 0.3

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
- `AGENTS.md`
- `SPEC.md`

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
  Armaments
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

## Public Layout

The public application pages are nested below a pathless TanStack Router layout
route. The root route remains UI-neutral and renders only its child outlet. The
public layout surrounds its outlet with the shared public header, navigation,
and footer without adding a URL segment.

Initial route hierarchy:

```text
rootRoute
└── publicLayoutRoute
    ├── indexRoute
    ├── weaponsRoute
    ├── bossesRoute
    ├── buildsRoute
    ├── damageCalculatorRoute
    ├── imprintRoute
    └── privacyRoute
```

The public layout uses a full-height flex structure. The content area grows so
the footer remains at the bottom of short pages. Header and footer may span the
viewport while their readable content remains constrained to the application
width.

The public header contains:

- the Gracebound brand link
- the main navigation on desktop
- the theme toggle
- Clerk sign-in or account controls
- a mobile menu button

On narrow viewports, the link list is replaced by a side drawer. The theme
toggle remains directly accessible in the header, while navigation links and
authentication controls are available inside the drawer. The drawer opens from
the right and must:

- show the public Home, Armaments, Bosses, Builds, and Damage Calculator links
- preserve the active-route indication
- close after route selection
- close through its explicit close button, backdrop interaction, or Escape
- prevent background scrolling while open
- move focus into the drawer and restore it to the menu button when closed
- use semantic controls and visible focus states
- respect `prefers-reduced-motion`

Application-level layout components use local Atomic Design where their
responsibilities justify it:

```text
src/app/layouts/public/
  PublicLayout.tsx
  components/
    atoms/
      MenuButton.tsx
      DrawerBackdrop.tsx
    molecules/
      BrandLink.tsx
      MainNavigation.tsx
    organisms/
      PublicHeader.tsx
      MobileNavigationDrawer.tsx
      PublicFooter.tsx
```

Public pages that contain individually protected actions may remain below the
public layout. A separate authenticated layout can be added later for pages
whose complete route content requires authentication; it is not required until
such a route exists.

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

- Armaments
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

# Armaments

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

## Unified Equipment Catalog

The public navigation exposes one `Equipment` destination at `/equipment`
instead of separate top-level destinations for armaments, armor, and talismans.
The legacy `/weapons` path redirects to the Armaments category so existing
links remain useful. The catalog is implemented incrementally:

1. establish the route, navigation, responsive header, and URL-owned category
   and search state;
2. connect independently paginated Armaments, Armor, and Talismans queries with
   loading, error, and empty states;
3. render a shared responsive catalog grid whose cards show a large icon,
   complete name, category, weight, and a concise category-specific summary;
4. open the existing category-specific details inside one reusable desktop
   side panel and mobile sheet layout;
5. load Armaments, Armor, and Talismans in stable 24-item pages, automatically
   request the next page near the end of each category, and retain an accessible
   manual load-more control; category-specific filters and sorting follow as
   separate increments.

The initial categories are `All`, `Armaments`, `Armor`, and `Talismans`.
Category and search values remain shareable URL search parameters, for example
`/equipment?category=talismans&search=claw`. The unified page coordinates the
three existing backend resources without replacing their domain types or REST
endpoints. Cards remain scannable; complete descriptions and detailed combat
values belong in the details view rather than being crowded into every card.
The catalog uses TanStack infinite queries and the backend `X-Total-Count`
header. Search remains URL-owned and server-side; changing it starts a new
paginated result set instead of filtering only the records already loaded.
Results use a stable alphabetical A-Z order. Category-specific URL filters are
weapon type and affinity for Armaments, equipment slot for Armor, and
calculation support for Talismans. The mixed `All` view does not display
category-specific controls.
The category selector is a labelled group of ordinary filter buttons with
`aria-pressed`; it must not claim tab semantics because it does not control a
corresponding set of tab panels.
Category-specific select controls are grouped in a semantic `fieldset` with a
programmatically available legend. Each select retains its own associated
visible label.
Opening item details locks background scrolling without losing the catalog
position. Closing through Escape, the close action, or the backdrop restores
the exact scroll coordinates and returns focus to the item card that opened the
dialog. A stable scrollbar gutter prevents horizontal layout movement while an
overlay is active.

## Spell Catalog

The public `/spells` page follows the same catalog interaction pattern as
Equipment while remaining its own feature and route. Its categories are `All`,
`Sorceries`, and `Incantations`. Search, spell type, and school remain URL-owned
filters. Selecting a type reveals only its applicable curated schools, such as
Gravity for Sorceries or Frenzied Flame for Incantations; changing the type
clears the previous school.

The page requests stable alphabetical 24-item pages through a TanStack infinite
query and retains the shared accessible load-more fallback. Cards expose the
spell icon, type, FP and memory-slot cost, schools, summary, and description.
The reusable item-details layout shows casting costs, attribute requirements,
calculation support, and verified buff metadata in a modal that follows the
shared focus, Escape, backdrop, scroll-lock, and focus-restoration behavior.

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

Boss catalog filters are URL-backed and use independent facets rather than one
mixed category: region, location type, major/minor rank, progression
(`required`, `route-dependent`, or `optional`), Great Rune reward, and
Remembrance reward. Contextual values that the backend still returns as `null`
must be shown as unclassified and must not silently match a negative filter.
Locations are exposed through an `encounters` array because one shared combat
profile can occur at multiple places. Search and filters use the paginated boss
API and its `X-Total-Count` header.
Boss catalog cards link to a dedicated detail route. The detail page owns the
expandable boss presentation because encounters, combat values, rewards, and a
future damage-simulator entry point exceed the scope of a compact dialog.

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

The production HTML preconnects to the origin derived from `VITE_API_URL`.
Branding artwork and API requests can therefore reuse an established connection
without maintaining a second environment-specific origin setting.

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

A build can contain:

- name
- description
- starting character class
- character level derived from the starting class and allocated attributes
- character attributes
- up to six weapon slots including variant, upgrade level, and optional Ash of War
- catalyst
- four armor slots
- up to four talismans
- Great Rune
- up to two Crystal Tears
- spells and memory stones
- supported body, aura, and weapon buffs
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

## Build Editor MVP Contract

The editor is implemented in vertical slices. Visual design and concrete component composition are decided before UI implementation and are not prescribed by this contract.

### Slice 1: Character foundation

Required inputs:

- starting character class
- Vigor
- Mind
- Endurance
- Strength
- Dexterity
- Intelligence
- Faith
- Arcane

Rules:

- A stat cannot be lower than the selected class's starting value.
- A stat cannot exceed the hard cap of 99.
- Character level is calculated by the backend from the starting class and allocated stats.
- Resource, defense, resistance, and item-discovery values come from the backend calculation response.
- Softcap behavior comes from imported game progression and scaling curves.
- The frontend must not reproduce level, resource, protection, weapon-scaling, or softcap formulas.
- A future softcap hint may compare backend-calculated outcomes for adjacent values; it must remain explanatory and must not become a second calculation authority.

Performance behavior:

- Input controls update locally without waiting for the backend.
- Changed build stats are sent after 350 milliseconds without another change.
- Several rapid changes are combined into one calculation request.
- The previous valid calculation remains available while a new result is loading.
- Obsolete in-flight preview requests are aborted.
- Saving a build remains a separate explicit operation.

Backend integration:

```text
GET  /api/character-classes
POST /api/builds/calculate-stats
```

#### Character-class selection experience

Creating a build starts with an atmospheric character-class selection before the compact stat editor is shown.

The agreed interaction is a carousel:

- The active class is centered and uses a large class image as its visual background.
- The active card shows the class name, starting level, and highlighted starting stats.
- The previous and next classes remain visible at the sides primarily through their darkened images.
- Clicking a side card moves that class into the center without immediately confirming it.
- A separate explicit action confirms the centered class.
- The carousel supports visible controls, keyboard navigation, and touch gestures.
- Class name and controls remain available as text and semantic controls; the image is not the only means of identification.
- Text over images requires a strong readability gradient and sufficient contrast.

After confirmation, the complete carousel content is replaced inside the same
build-workspace frame by the editor. A `Change character` action restores the
carousel. When changing class, existing target stats are preserved. A value
below the new class's starting value is raised to that starting value, and the
backend recalculates the resulting character level. Equipment selections remain
unchanged unless backend validation identifies an incompatible selection.

The resulting editor follows a hybrid presentation:

- Character stats and calculated values use a compact, data-oriented layout.
- Equipment, talismans, spells, and similar selections use richer icon-based presentation.
- Desktop character editing places controls and live results side by side.
- Narrow viewports stack the calculated results below the controls.
- Precise stat controls use decrement, increment, and direct numeric input instead of an imprecise slider.

Large class images must not be added to the public repository. Before implementing the carousel, the available local game assets must be checked for suitable class artwork and integrated through the existing private asset strategy where legally and technically appropriate.

### Slice 2: Equipment and loadout

The editor progressively adds:

- weapon slots, variants, reinforcement levels, and compatible Ashes of War
- armor slots
- talismans
- Great Rune
- Crystal Tears
- spells, catalyst, and memory stones
- supported buffs

#### Editor presentation

The build editor is an interactive loadout workspace rather than a long linear
form. Its desktop presentation combines the following regions:

- a compact build header with name, visibility, save action, and damage-test entry point
- a character and attribute region with level, invested points, resource values, and estimated rune cost
- three right-hand and three left-hand weapon slots
- fixed head, body, arms, and legs armor slots
- four talisman slots, one Great Rune slot, and two Crystal Tear slots
- a spell-memory region constrained by the build's available memory slots
- equipped buff spells remain visible in the spell-memory region; activation is handled by the Damage Trial
- a grouped, readable summary of calculated offense, resources, defenses, resistances, and equipment load

The editor does not activate Aura, Body, weapon-skill, or temporary weapon
buffs and excludes them from its offense preview. It records the spell and
armament loadout; transient combat-effect activation belongs exclusively to
the Damage Trial, where it can be changed without modifying the build.

The main desktop workspace follows a three-region character-sheet layout. A
compact portrait of the selected starting class and its editable attributes
sit on the left, equipment occupies the visual center, and calculated status
values sit on the right. The status region groups resources, the currently
focused weapon's supported actions, defenses, absorption, and resistances.
The editor uses the available viewport width rather than constraining all three
regions to the normal content shell. The established equipment panel keeps its
own spacious center region; the character and status panels are independent
siblings rather than content nested inside it. On narrower viewports these
regions become three task-focused tabs named Leveling, Equipment, and Status,
so users do not have to scroll through unrelated editor sections.
The desktop status inspector keeps a compact overview of level, resources,
equipment-load category, and poise visible above three focused views: Offense,
Defense, and Resistances. Only the selected detail view is rendered so the
right-hand region remains scannable instead of becoming one long status list.
The inspector may become sticky below the public navigation on wide screens,
but should avoid an unnecessary nested scrollbar.
Selecting or editing an equipped weapon makes it the focused weapon without
changing the loadout. Focus is UI state separate from saved equipment state;
the same interaction can later be extended to an equipped catalyst and spell
without introducing a universal abstraction before it is needed.

Narrow viewports use task-focused tabs instead of compressing the complete
desktop workspace. The initial mobile sections are Character, Equipment,
Spells, Buffs, and Results. A compact result summary may remain accessible
while moving between tabs, but it must not obscure the active controls.
The compact Build Editor tabs follow the ARIA automatic-activation pattern.
Only the active tab participates in the normal Tab sequence; Arrow Left/Right
wrap between tabs, while Home and End select the first and last tab. Every tab
controls a correspondingly labelled tab panel.

Selecting an empty or occupied slot opens a searchable, filterable item picker.
Use a side panel on wide screens and a full-height sheet on narrow screens.
Catalog items are shown as scrollable icon-based choices. Invalid choices are
excluded or visibly disabled rather than accepted and rejected later without
explanation.

Weapon configuration stays attached to the selected weapon slot and exposes
upgrade level, affinity, and a compatible Ash of War. Unique weapon skills are
shown as fixed. Interchangeable Ashes and affinities must be limited to valid
backend-provided combinations. Variant choices use the backend-provided maximum
upgrade level rather than inferring `+10` or `+25` from weapon categories.

Attribute controls expose decrement, increment, and direct numeric input.
They show class minimums, the resulting character level, invested levels, and
the backend-calculated rune cost for the next level and for reaching the
planned level from the selected class. Attribute inputs, invested levels, and
the resulting level update locally without waiting for the debounced stats
request; derived game values and rune costs remain backend-owned. Changed
calculated values may be highlighted briefly, and softcap
hints remain explanatory rather than duplicating backend formulas.

The visual foundation uses theme-token-driven CSS gradients, vignette, and
subtle texture. A future original transparent Gracebound character silhouette
may sit behind the desktop equipment layout, but slots and labels must remain
understandable without it. The silhouette is reduced or removed on mobile.
Do not commit Elden Ring screenshots or extracted game UI assets.

Empty equipment slots combine a consistent slot frame with a recognizable
category glyph. Original local menu-frame assets may be extracted, optimized,
and served through the private MongoDB asset pipeline. Custom glyphs fill gaps
where the game does not provide a clear slot-specific symbol.

The editor follows feature-local Atomic Design. Repeating visual primitives
such as slot frames, icons, labels, badges, and stat buttons form atoms. A
complete equipment slot, attribute control, buff chip, stat row, or picker item
forms a molecule. Hand loadouts, armor and talisman groups, the item picker,
spell-memory panel, buff bar, calculated-stat summary, and damage-test panel
form organisms. The page composes these organisms while draft orchestration
remains in feature hooks or form state. Components are split by meaningful
responsibility and reuse, not by file-count targets.

Persistable editor selections are coordinated by a feature-owned draft hook;
transient state such as the active tab, focused item, and open picker is not
part of the saved build. The draft uses editor-facing slot identifiers, while
pure domain mappers translate those identifiers to the backend write contract
and map saved API builds back into an editor draft. Server-owned `id`,
`ownerId`, `gameVersion`, and timestamp fields must never enter a build write
payload. Mapping must copy nested mutable values so editing a hydrated draft
cannot mutate TanStack Query cache data.

Authenticated users save explicitly through an accessible themed dialog. The
dialog edits the build name, description, and private/public visibility. The
first save creates a build; later saves update that build, while `Save as new`
creates a distinct copy. Successful writes invalidate owned and public build
queries. The editor tracks its last successfully saved draft and warns before
both client-side navigation and browser unload when newer changes exist. A
failed request leaves the dialog and dirty state intact. Save requests attach
the current Clerk token but never send an owner ID or game version.

Selection dependencies must be respected. For example, a weapon variant belongs to one weapon, an Ash of War must be compatible with the selected weapon, and selected spells must be compatible with the catalyst and available memory slots.

`POST /api/builds/calculate-stats` remains the authority for effective attributes, equipment load, resources, defenses, resistances, catalyst scaling, memory slots, and validation of supported catalog selections.

Level and rune-cost feedback is mirrored by the frontend's deterministic
progression formula so it updates in the same interaction frame. The debounced
stats response remains authoritative for aggregate values. A selected item with
unmet requirements or catalog-only effects is a local limitation, not a failure
of the complete stats preview: its warning belongs to that item while unrelated
character and equipment values remain visible.

### Slice 3: Damage evaluation

The editor can calculate supported weapon, skill, and spell output with or without a selected boss. The backend remains responsible for attack rating, motion values, buffs, defense, absorption, and final estimated damage.

Boss evaluation is opened deliberately through a `Test against a boss` action
instead of permanently occupying the main editor. The user selects a boss and
one supported action such as a light, heavy, charged, jumping, critical, skill,
spell, or incantation attack. Results distinguish pre-mitigation output, final
estimated damage, damage types, boss-health percentage, status buildup, active
buffs, and explicit limitations. Local previews may react immediately while a
backend request remains authoritative for the final result.

Backend integration:

```text
POST /api/damage/calculate
POST /api/me/builds/:buildId/calculate-damage
```

Saving, editing, and deleting builds remain authenticated operations under `/api/me/builds`.

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

The initial `/builds` overview is implemented as two responsive sections:

- a Clerk-aware creation callout that offers sign-in to anonymous visitors
- a public build gallery backed by `GET /api/builds`

The gallery provides loading, empty, error with retry, and success states.
Overview cards display name, description, level, starting-class identifier, and
the three highest character attributes. Each card links to the public detail
route at `/builds/$buildId`. That route hydrates referenced catalog entries and
shows all attributes plus recorded armaments, armor, talismans, spells, Great
Rune, and Crystal Tears with their available icons. It remains readable without
authentication. A signed-in user may copy the public build as a new private
record through the authenticated create endpoint; anonymous users receive the
Clerk sign-in action first. Owner identity remains absent until a dedicated
public owner-display contract exists.

The dedicated `/builds/new` route is the authenticated entry into build
creation. Anonymous visitors receive a Clerk sign-in prompt; authenticated
users begin with the existing character-class selector. The attribute editor
and build persistence remain later vertical increments on this route.

Authenticated users reach their personal build collection at `/my-builds`,
presented as **Tarnished Records** rather than a generic analytics dashboard.
The archive lists only the current user's protected `/api/me/builds` response,
filters locally by private or public visibility, and provides an entry to forge
a new build. A record can be duplicated as a new private build or permanently
deleted after an accessible confirmation dialog. Duplication constructs a new
allowlisted write payload; deletion and duplication attach the Clerk token and
remain subject to backend ownership enforcement. Each record links to its
protected owner-edit route at `/my-builds/$buildId/edit`. That route loads the
saved build through `GET /api/me/builds/:buildId`, then hydrates only its
referenced large-catalog records through detail endpoints. Small fixed catalogs
such as character classes, Great Runes, and Crystal Tears may be loaded as
complete lists. The editor mounts only after hydration and treats the restored
draft as its saved baseline, so opening a record never creates a false unsaved-
change warning. Missing, stale, or inaccessible references produce an explicit
unavailable state instead of silently substituting another item.

---

# Damage Calculator

The Damage Calculator is one of the primary technical features of the application.

Anonymous users may use the calculator with manually selected values.

Authenticated users may additionally load data from one of their saved builds.

Users should be able to select:

- character stats or an existing owned build
- weapon
- weapon variant or infusion
- weapon upgrade level
- target enemy or boss
- supported normal attack, Ash of War attack, or spell
- supported talismans, armor effects, Great Rune, Crystal Tears, and buffs

The backend performs the actual damage calculation.

The frontend displays the result.

## Damage Trial

The first interactive boss trial loads one authenticated user's saved build and
one catalog boss. Each explicit attack-button activation represents one
confirmed hit and creates exactly one protected backend request. Supported
weapon attacks, skills, and equipped spells reduce a local simulated boss-health
value and append an in-memory combat-log entry. Time, DPS, stamina, cumulative
status buildup, boss actions, and automatic multi-hit assumptions are outside
this simulation.

The trial preserves the backend response for every log entry so attack rating,
pre-mitigation output, final per-type damage, components, active modifiers, and
limitations remain inspectable. Undo restores the health before the last entry;
reset restores full boss health and clears the log without changing the selected
build or target. Trial history is not persisted to MongoDB.

The encounter remains linear on narrow viewports. On desktop it expands into a
three-region combat workspace: saved Great Rune, Wondrous Physick, and buff
toggles sit on the left; boss identity, health, attack selection, and combat
history form the central fight area; and the target's defenses and absorptions
remain visible in a dedicated right-hand panel. Effect toggles are transient
trial state and never mutate the saved build. Every damage request sends the
currently active subset, which the backend validates against the owned build
before applying it.
All equipped Aura and Body buff spells are offered in this panel even when the
saved build did not mark them active. Persisted active buff IDs determine only
their initial toggle state.

Combat actions use a two-step source flow to keep the encounter compact. The
user first selects one equipped armament and then chooses from that source's
supported action cards. A Staff or Sacred Seal remains an armament source;
selecting it reveals only equipped damaging spells whose Sorcery or Incantation
type is supported by that catalyst's backend-provided casting types. Changing
the source changes only the visible action cards and does not change the saved
loadout.
Clicking an available attack, skill, or spell card immediately represents one
confirmed hit and sends its single damage request. There is no separate
confirmation or perform-attack panel between the action cards and combat log.
A successful response triggers a brief decorative slash across the boss-health
bar and a restrained portrait impact. The feedback is never used as the only
damage indication and is disabled when reduced motion is requested.

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
- PvP-specific calculations
- complete support for every exceptional weapon skill, spell, buff, or status mechanic

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
  app/
    layouts/
      public/

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

The public navbar uses the privately stored Gracebound wordmark through the
backend branding-asset endpoint. The source and generated logo files are not
committed to the frontend repository. The experimental home hero is currently
rendered as a full-width responsive image section. It uses a compact portrait
derivative on narrow viewports and a separately prepared 2048x1152 asset from the
`gracebound-hero-desktop` endpoint on wider viewports. The artwork itself has no
interactive responsibility; semantic content and the future call to action
remain separate HTML components.

The full-page Grace and Night backgrounds are private MongoDB branding assets.
`PageBackground` resolves both backend URLs and crossfades its non-interactive
layers with the theme. Native `picture` selection serves cropped mobile WebP
derivatives on narrow viewports. No background image bytes are committed to the
frontend repository, and a theme-colored dimmer preserves content contrast
independently of the artwork.

The home page places a concise unofficial fan-project disclaimer directly below
the hero. The public footer links to dedicated Impressum and Datenschutz pages.
Legal drafts must display missing operator, hosting, retention, and contractual
details explicitly; never invent production details or present an incomplete
draft as publication-ready.

## Theme System

The frontend uses Tailwind CSS with application-owned components. No external
component library is required by default.

Components consume semantic theme utilities such as `background`, `surface`,
`foreground`, `border`, `accent`, and `focus`. Concrete color values belong in
the central theme definition, not in React components or scattered CSS files.
Avoid inline styling, repeated literal colors, and arbitrary Tailwind values
when a shared theme token is appropriate.

Gracebound supports two atmospheric themes:

- `grace`: warm charcoal and parchment surfaces with stronger golden accents
- `night`: midnight-blue surfaces with muted moon-blue details and gold as the
  shared Grace accent

Cinzel is the application heading and branding typeface. Load the Google Fonts
family in weights 400 through 700 with `display=swap`; retain Georgia and
`Times New Roman` as local fallbacks. Body copy remains in Inter or the system
sans-serif stack for readability.

Neither theme uses a generic bright-white application surface. Both themes
must preserve readable contrast, visible focus states, and consistent semantic
meaning. Theme selection will be stored locally and applied before rendering to
avoid a visible theme flash.

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

The public layout provides a keyboard-visible skip link targeting the content
container. Every route retains a level-one page heading, including intentionally
empty page foundations where the heading may be visually hidden. Navigation
links expose their current-page state through the router.

Async loading and completion states use polite status semantics where the
change benefits assistive-technology users. Error states remain alerts. Avoid
placing large changing cards or sections inside live regions; announce a short,
specific summary instead. Decorative images are hidden from assistive
technology, while branding and character artwork retain meaningful alternative
text.

Reusable modal behavior owns initial focus, Tab containment, Escape handling,
background scroll locking, scroll restoration, and focus restoration. Build
Editor tabs follow the complete horizontal keyboard pattern. URL-backed
equipment categories remain pressed filter buttons rather than claiming tab
semantics, and category-specific filters use `fieldset` and `legend`.

Representative reusable controls and composed UI states are audited with
`axe-core` in Vitest. These JSDOM checks exclude color and layout-dependent
rules, so browser review remains required for contrast, visible focus, responsive
zoom, and the complete keyboard journey.

---

# Testing

Frontend test stack:

- Vitest
- React Testing Library
- axe-core accessibility audits

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
- complete Elden Ring mechanic coverage

---

# Stretch Goals

Possible stretch goals:

- favorite builds
- build ratings
- build sharing
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
