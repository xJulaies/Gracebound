import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import type { Build } from "../../builds/types/build.types";
import { toggleGeneralBuff } from "../../builds/domain/toggleGeneralBuff";
import { useCrystalTearsQuery } from "../../crystal-tears/hooks/useCrystalTearsQuery";
import { useGreatRunesQuery } from "../../great-runes/hooks/useGreatRunesQuery";
import { getSpell } from "../../spells/api/spells.api";
import type { Spell } from "../../spells/types/spell.types";
import type { DamageTrialEffectsSelection } from "../types/damageTrial.types";

export function useDamageTrialEffects(build: Build) {
  const [selection, setSelection] = useState<DamageTrialEffectsSelection>(() => ({
    greatRuneActive: Boolean(build.equipment.greatRuneId),
    wondrousPhysickActive: build.equipment.crystalTearIds.length > 0,
    activeBuffSpellIds: [...build.equipment.buffSpellIds],
    weaponBuffActive: Boolean(build.equipment.weaponBuff),
  }));
  const greatRunesQuery = useGreatRunesQuery();
  const crystalTearsQuery = useCrystalTearsQuery();
  const spellIds = [...new Set([
    ...build.spellIds,
    ...(build.equipment.weaponBuff ? [build.equipment.weaponBuff.spellId] : []),
  ])];
  const spellQueries = useQueries({
    queries: spellIds.map((spellId) => ({
      queryKey: ["spells", "detail", spellId],
      queryFn: () => getSpell(spellId),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const spells = spellQueries.flatMap((query) => query.data?.data ?? []);

  return {
    selection,
    greatRune: greatRunesQuery.data?.data.find(({ id }) => id === build.equipment.greatRuneId) ?? null,
    crystalTears: crystalTearsQuery.data?.data.filter(({ id }) => build.equipment.crystalTearIds.includes(id)) ?? [],
    buffs: spells.filter((spell): spell is Spell => (
      spell.buffEffect?.slot === "aura" || spell.buffEffect?.slot === "body"
    )),
    weaponBuff: build.equipment.weaponBuff
      ? spells.find(({ id }) => id === build.equipment.weaponBuff?.spellId) ?? null
      : null,
    isLoading: greatRunesQuery.isPending || crystalTearsQuery.isPending || spellQueries.some(({ isPending }) => isPending),
    toggleGreatRune: () => setSelection((current) => ({ ...current, greatRuneActive: !current.greatRuneActive })),
    togglePhysick: () => setSelection((current) => ({ ...current, wondrousPhysickActive: !current.wondrousPhysickActive })),
    toggleBuff: (spellId: string) => {
      const spell = spells.find(({ id }) => id === spellId);
      if (!spell) return;
      setSelection((current) => ({
        ...current,
        activeBuffSpellIds: toggleGeneralBuff(current.activeBuffSpellIds, spell, spells),
      }));
    },
    toggleWeaponBuff: () => setSelection((current) => ({ ...current, weaponBuffActive: !current.weaponBuffActive })),
  };
}

export type DamageTrialEffectsController = ReturnType<typeof useDamageTrialEffects>;
