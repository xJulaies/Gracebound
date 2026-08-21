# Damage calculation MVP

`POST /api/damage/calculate` accepts either attack rating directly or a weapon
ID, upgrade level, and character stats. The weapon path currently uses a small
ERDB 1.10.0 reference dataset containing Moonveil and the Grafted Blade
Greatsword.

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

- only two versioned weapon fixtures; no complete ERDB import yet
- no built-in boss records
- no buffs or status-effect damage
- no special attack mechanics
- one shared target-defense value for all damage types
