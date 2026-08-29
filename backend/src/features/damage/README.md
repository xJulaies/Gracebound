# Damage calculation MVP

`POST /api/damage/calculate` accepts either attack rating directly or a weapon
ID, upgrade level, and character stats. Both request forms accept an optional
`bossId`. At runtime, the weapon and selected boss are read from the normalized
Regulation dataset for the configured game version in MongoDB.
Database integration tests use a small normalized Regulation fixture in a
MongoDB Memory Server; Atlas is never required for automated tests.

Without `bossId`, the endpoint returns boss-independent offensive output and
does not claim final dealt damage. With `bossId`, it applies the stored defense
and absorption values and additionally returns estimated damage. Client-
supplied boss combat values are rejected.

Weapon requests use `attackId`. The backend loads that weapon's imported attack
profile and applies its Regulation-derived per-damage-type motion values and
physical attack type. `motionValue` and `physicalAttackType` remain available
only for the explicit manual attack-rating request form.

Calculation order for each damage type:

```text
attack rating
  -> motion value
  -> target defense
  -> target absorption
  -> floor to whole damage
```

The defense multiplier uses the community-documented, piecewise
attack-to-defense ratio formula. Results are therefore returned with
`accuracy: "estimated"`.

Current limitations:

- the Regulation weapon and boss catalogs must be imported before runtime use
- no buffs or status-effect damage
- no special attack mechanics
- the imported direct-melee slice contains 9,810 profiles for 318 weapons
  across 29 motion categories in Regulation 1.17.0
- jump, critical, mounted, projectile, spell, and special behaviors remain
  excluded until their mappings and calculation rules are separately verified

Target defense is calculated separately for every damage type. Physical damage
also selects `standard`, `slash`, `strike`, or `pierce` absorption. This mirrors
the normalized Regulation boss model and avoids applying one generic resistance
to every component of a split-damage weapon.

Selected normal weapon attacks can be mapped locally through
`BehaviorParam_PC.refId -> AtkParam_Pc.ID`. The normalized attack profile keeps
one motion value per damage type and resolves inherited physical attack
attributes through the weapon row. Projectile behaviors and Ashes of War remain
separate from normal attack profiles.

Selected Ashes of War are represented as multi-component skill attacks. For
example, Transient Moonlight contains a projectile with added magic damage and
a separate weapon hit with weapon-AR motion values. Each component preserves
its own final damage rates. A weapon request selects exactly one normal
`attackId` or one `skillAttackId`; both are resolved only within that weapon.
Complete Ash-of-War coverage is not part of the MVP; unsupported skill mechanics
must still be rejected instead of approximated.
