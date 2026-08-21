# Damage calculation MVP

`POST /api/damage/calculate` currently accepts attack rating and target values
directly. Weapon selection and ERDB-derived attack-rating calculation will be
added behind the game-data import boundary later.

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

- no weapon or ERDB lookup
- no built-in boss records
- no buffs or status-effect damage
- no special attack mechanics
- one shared target-defense value for all damage types

