# Damage calculation MVP

`POST /api/damage/calculate` accepts either attack rating directly or a weapon
ID, upgrade level, and character stats. At runtime, the weapon path reads the
normalized Regulation dataset for the configured game version from MongoDB.
Database integration tests use a small normalized Regulation fixture in a
MongoDB Memory Server; Atlas is never required for automated tests.

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

- the complete Regulation weapon catalog must be imported before runtime use
- no built-in boss records
- no buffs or status-effect damage
- no special attack mechanics
- attack motion values are still supplied by the client; exact move data from
  `AtkParam_Pc` and its behavior links is not imported yet

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
its own final damage rates. Complete Ash-of-War coverage is not part of the MVP;
unsupported skill mechanics must still be rejected instead of approximated.
