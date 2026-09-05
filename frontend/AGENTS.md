# AGENTS.md

## Purpose

This document defines the development rules, architectural conventions, and quality expectations for the frontend of the Elden Ring Companion application.

The project is a four-week final project intended to demonstrate practical knowledge of modern React development while still being developed as a coherent, maintainable product.

The goal is not to overengineer the application. Prefer solutions that are understandable, testable, and appropriate for the actual project scope.

---

# Core Principles

## 1. Prefer clarity over cleverness

Code should be easy to understand for another developer.

Avoid:
- unnecessary abstractions
- premature generalization
- deeply nested component logic
- complex patterns without a concrete benefit

Create abstractions only when they solve an actual recurring problem.

## 2. Keep responsibilities separated

UI rendering, server communication, validation, domain logic, and form logic should remain clearly separated.

React components should not contain complex Elden Ring calculation logic.

Do not mix raw API requests directly into presentation components.

## 3. Feature-based architecture

The frontend uses feature-based architecture as its primary organizational model.

Example:

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

Feature-specific code belongs inside its corresponding feature.

Avoid global folders such as `src/components` for business-specific components.

Example:

Preferred:

```text
src/features/builds/components/BuildCard.tsx
```

Avoid:

```text
src/components/BuildCard.tsx
```

## 4. Feature-based architecture with local Atomic Design

Feature-based architecture is mandatory and defines the primary organization of the application.

Atomic Design is applied locally inside features when a feature contains enough UI complexity to benefit from component composition.

Preferred structure for a sufficiently complex feature:

```text
src/
  features/
    builds/
      components/
        atoms/
        molecules/
        organisms/
      api/
      hooks/
      schemas/
      types/
```

Atomic categories must not be created as empty architectural boilerplate.

A small feature may keep its components directly inside `components/` until meaningful atom, molecule, or organism boundaries emerge.

Business-specific components must remain inside their responsible feature.

Application-wide reusable UI primitives belong in:

```text
src/shared/ui/
  atoms/
  molecules/
```

Move a component into `shared/ui` only when it is genuinely reusable across multiple features.

The build editor must remain a feature-owned workspace assembled from focused
parts rather than one large component. Slot primitives, slot groups, item
pickers, attribute controls, buff indicators, calculated-stat summaries, and
mobile tab navigation should be separated when they have distinct behavior.
Keep selection and draft orchestration in feature hooks or form state; do not
hide domain rules inside visual slot components.

Atomic Design is mandatory for the build editor because its interface is
composed from many repeating controls. Use the following responsibility levels:

- atoms: icon, slot frame, label, badge, increment/decrement button, numeric input, and status indicator
- molecules: equipment slot, attribute control, buff chip, stat row, spell-memory slot, and picker result item
- organisms: weapon-hand group, armor group, talisman group, spell-memory panel, buff bar, item picker, attribute panel, calculated-stat summary, and damage-test panel

Pages and editor layout components compose organisms and own only page-level
arrangement. Hooks or form state coordinate the selected build draft. Domain
helpers validate and transform data. Atoms and molecules must not fetch data,
know route details, or perform build calculations. Reuse a component when its
contract genuinely repeats; do not create one-line wrapper components merely
to satisfy an Atomic Design label.

Design the editor mobile-first. Mobile uses task-focused tabs and a full-height
item-selection sheet; desktop may use a multi-region workspace, side panel,
sticky summary, and optional decorative character silhouette. Every slot must
remain identifiable by text or accessible labeling without relying on an icon
or background image.

Extracted Elden Ring menu frames, category icons, screenshots, and intermediate
image files are local source artifacts and must not be committed. Serve approved
optimized UI assets through the backend asset pipeline. Build the atmospheric
background primarily from reusable theme tokens and CSS; decorative artwork
must not determine the layout or reduce text contrast.

---

# TypeScript

Use TypeScript strictly.

Avoid `any`.

Prefer explicit domain types and readable interfaces.

Example:

```ts
interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
}
```

Do not duplicate types unnecessarily.

Frontend-facing API types should represent the backend API contract, not raw ERDB structures.

---

# React

Use functional components.

Prefer small, focused components.

Avoid components that combine:
- fetching
- business logic
- validation
- mutation handling
- large UI structures

Extract logic when responsibilities become unclear.

Do not use `useEffect` for data fetching when TanStack Query can handle it.

Do not manually mirror server state into React state.

Use React state only for local client-side UI state.

---

# TanStack Router

TanStack Router is responsible for application routing.

Route search parameters should be used for state that belongs in the URL, including:
- search
- filters
- sorting
- pagination

Example:

```text
/weapons?type=katana&sort=damage&page=2
```

Keep route files relatively small.

Complex UI and business-specific behavior belong inside features.

---

# TanStack Query

TanStack Query manages server state.

Use it for:
- API fetching
- caching
- loading state
- error state
- mutations
- cache invalidation
- optimistic updates only when appropriate

Do not duplicate TanStack Query data into local React state without a concrete reason.

Reusable query options may be extracted when multiple parts of the application require the same resource.

---

# TanStack Form and Zod

Use TanStack Form for complex forms.

Use Zod for frontend validation.

Validation schemas should normally live inside the responsible feature.

Example:

```text
features/builds/schemas/build.schema.ts
```

Frontend validation improves user experience.

The backend remains the final validation authority.

---

# Authentication

Authentication is handled with Clerk.

The frontend may:
- display signed-in or signed-out states
- attach authenticated tokens to protected backend requests
- hide or disable UI actions based on authentication state

The frontend must never be treated as a security boundary.

Protected actions must still be authenticated and authorized by the backend.

Do not trust client-side ownership checks.

---

# Protected User Features

The following functionality requires an authenticated user:

- creating builds
- reading private user builds
- editing owned builds
- deleting owned builds
- changing build visibility
- managing user-owned favorites if implemented

The frontend should call protected `/api/me/*` backend routes for user-owned resources.

Do not send a user ID to determine ownership.

The authenticated identity is resolved by the backend through Clerk.

---

# API Communication

The frontend communicates with the application's own backend.

Do not call ERDB directly from React components.

Preferred flow:

```text
React
  -> Backend REST API
  -> Application domain layer
  -> ERDB-derived data / MongoDB
```

Create centralized API functions.

Example:

```text
features/weapons/api/
  getWeapons.ts
  getWeapon.ts
```

Avoid raw endpoint strings scattered throughout UI components.

---

# Game Data Boundary

The frontend must not depend on ERDB response structures.

The backend exposes application-specific domain models.

Frontend code should consume only the application's REST API contract.

---

# Domain Logic

Complex Elden Ring calculations should not live inside React components.

Examples:
- attack rating calculations
- damage-per-hit calculations
- scaling calculations
- defense calculations
- absorption calculations
- character-level calculations
- progression curves and softcap behavior

The frontend may format or visualize calculation results but should not duplicate backend damage formulas.

Softcap indicators must be derived from backend-calculated outcomes or explicit backend metadata. Do not maintain a separate frontend table of gameplay caps as a second source of truth.

---

# Styling

Use Tailwind CSS and application-owned components. Do not introduce a component
library without a demonstrated requirement.

React components must use semantic theme utilities. Do not place literal hex,
RGB, or HSL colors in components, duplicate theme values with arbitrary
Tailwind classes, or scatter component styling across unrelated CSS files.
Concrete theme values belong in the central theme definition.

The visual direction should feel:
- dark
- elegant
- medieval
- modern
- readable

The interface may take inspiration from Elden Ring's atmosphere without directly cloning the game's UI.

Usability takes priority over imitation.

---

# Responsive Design

Desktop is the primary design target.

The application must remain usable on:
- tablet
- mobile

Complex tables may transform into cards or simplified layouts on smaller screens.

---

# Accessibility

Use semantic HTML.

Requirements:
- keyboard-accessible interactions
- labeled form inputs
- visible focus states
- sufficient contrast
- proper button and link semantics

Do not use clickable `<div>` elements where a semantic button or link is appropriate.

Accessibility is part of the definition of done for every new or changed UI
feature. Do not postpone keyboard and screen-reader behavior as optional polish.

For every interactive feature:

- every action must be reachable and operable with the keyboard
- native semantic elements are preferred over recreated ARIA widgets
- icon-only controls require an accessible name
- decorative images use empty alternative text; informative images require a
  concise meaningful alternative
- inputs and selects require programmatically associated labels
- loading, error, empty, and important update states must be announced where
  appropriate without creating noisy live regions
- removing the browser focus outline is allowed only when an equally visible
  `:focus-visible` treatment replaces it

Modal dialogs, drawers, and full-screen pickers must:

- expose `role="dialog"`, `aria-modal="true"`, and an accessible name
- move focus to a useful control when opened
- keep Tab and Shift+Tab focus inside while open
- close with Escape unless the interaction explicitly requires otherwise
- prevent interaction and background scrolling behind the overlay
- restore focus to the element that opened them
- preserve the underlying page scroll position
- support explicit close and backdrop behavior where appropriate

ARIA tab interfaces must implement the complete keyboard pattern: one tab in
the normal tab order, Arrow Left/Right navigation, Home/End navigation,
`aria-selected`, `aria-controls`, and a matching labelled `tabpanel`. If the UI
only filters or changes a URL-backed category, prefer ordinary buttons with
`aria-pressed` instead of presenting it as a tab interface.

Grouped filters should use semantic `fieldset` and `legend` markup when they
form one named control group. Dynamic catalog updates must preserve a logical
focus position and must not unexpectedly move keyboard users when more results
are appended.

Meaningful tests should cover keyboard opening, focus containment, Escape,
focus restoration, accessible names, and relevant state relationships. Static
ARIA attributes alone are not considered sufficient verification.

Reusable interactive patterns and important composed UI states must also pass
an automated `axe-core` audit in Vitest. Keep behavioral keyboard tests because
an automated audit does not verify interaction quality. The JSDOM audit excludes
rules that require real layout and rendered colors; verify contrast and visual
focus in a real browser.

---

# Error and State Handling

Every asynchronous feature must consider:
- loading
- success
- empty
- error

Do not silently swallow API errors.

Provide meaningful user feedback where appropriate.

Protected requests must also handle:
- unauthenticated state
- forbidden access
- expired or invalid authentication

---

# Testing

Frontend testing stack:

- Vitest
- React Testing Library
- axe-core for automated accessibility checks

Prioritize tests for:
- meaningful user interactions
- complex form behavior
- utility functions
- important feature flows

Do not test implementation details unnecessarily.

Backend domain calculations are tested in the backend and should not be duplicated in frontend tests.

---

# Naming

Use English naming.

Components:

```text
PascalCase
BuildCard.tsx
WeaponDetails.tsx
```

Functions and variables:

```text
camelCase
calculateDisplayValue()
```

Types:

```text
PascalCase
Weapon
Build
DamageResult
```

Constants:

```text
UPPER_SNAKE_CASE
```

Avoid unclear abbreviations.

---

# File Organization

A feature may contain:

```text
feature/
  api/
  components/
  hooks/
  schemas/
  types/
  utils/
```

Only create folders that are actually needed.

Avoid architectural boilerplate with empty folders.

---

# State Management Rules

Do not introduce Redux, Zustand, or another global state library unless a concrete project requirement appears that cannot be handled cleanly by the current stack.

Use:
- TanStack Query for server state
- TanStack Router for URL state
- TanStack Form for form state
- React state for local UI state

---

# Refactoring Rules

Do not refactor unrelated code while implementing a feature unless necessary.

Prefer incremental changes.

Before introducing a new abstraction:
1. check whether an existing pattern solves the problem
2. verify that the abstraction has more than theoretical value

Do not create generic shared components after only one use.

---

# Dependency Rules

Do not introduce new dependencies without a clear benefit.

Before adding a package, consider:
- necessity
- maintenance
- project scope
- duplication with existing dependencies

---

# Completion Criteria

A frontend feature is not finished when it only visually works.

Consider:
- TypeScript correctness
- validation
- loading state
- error state
- empty state
- authentication state
- responsiveness
- accessibility
- maintainability
- integration with the backend API

---

# Agent Instructions

Before implementing or modifying a feature:

1. Inspect the existing architecture.
2. Identify the responsible feature.
3. Reuse existing patterns where possible.
4. Keep changes scoped to the requested task.
5. Avoid new dependencies unless clearly justified.
6. Respect the backend API contract.
7. Never bypass protected backend behavior through client-only logic.
8. Explain significant architectural decisions when introducing them.

Do not rewrite working architecture without a concrete reason.

If a requested change conflicts with this document or `SPEC.md`, explicitly identify the conflict before changing the architecture.
