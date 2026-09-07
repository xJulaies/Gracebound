import { useMemo, useState } from "react";
import { useInfiniteSpellsQuery } from "../../../spells/hooks/useSpellsQuery";
import { SpellDetailsContent } from "../../../spells/components/molecules/SpellDetailsContent";
import type { Spell, SpellSchool } from "../../../spells/types/spell.types";
import { INCANTATION_SCHOOLS, SORCERY_SCHOOLS } from "../../../spells/types/spell.types";
import { formatSpellLabel } from "../../../spells/domain/formatSpellLabel";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";
import { SpellPickerItem } from "../molecules/SpellPickerItem";

interface SpellPickerProps {
  availableMemorySlots: number;
  excludedIds: string[];
  onClose: () => void;
  onRemove?: () => void;
  onSelect: (spell: Spell) => void;
  slotLabel: string;
}

export function SpellPicker({
  availableMemorySlots,
  excludedIds,
  onClose,
  onRemove,
  onSelect,
  slotLabel,
}: SpellPickerProps) {
  const [search, setSearch] = useState("");
  const [previewedSpell, setPreviewedSpell] = useState<Spell | null>(null);
  const query = useInfiniteSpellsQuery({
    ...(search.trim() && { search: search.trim() }),
    limit: 50,
  });
  const excluded = useMemo(() => new Set(excludedIds), [excludedIds]);
  const spells = (query.data?.pages.flatMap(({ data }) => data) ?? [])
    .filter(({ id, slotsRequired }) => !excluded.has(id) && slotsRequired <= availableMemorySlots);
  const spellGroups = groupSpells(spells);

  return (
    <ItemPickerLayout
      actions={onRemove && (
        <button className="build-secondary-action" onClick={onRemove} type="button">
          Remove spell
        </button>
      )}
      headingId="spell-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewedSpell && (
        <ItemDetailsPreview
          description={previewedSpell.description}
          iconUrl={previewedSpell.iconUrl}
          onClose={() => setPreviewedSpell(null)}
          subtitle={previewedSpell.type === "sorcery" ? "Sorcery" : "Incantation"}
          title={previewedSpell.name}
        >
          <SpellDetailsContent spell={previewedSpell} />
        </ItemDetailsPreview>
      )}
      searchLabel="Search spells"
      searchPlaceholder="Search sorceries and incantations…"
      searchValue={search}
      subtitle={`For ${slotLabel} · ${availableMemorySlots} memory ${availableMemorySlots === 1 ? "slot" : "slots"} available`}
      title="Select a spell"
    >
      {query.isPending && <p aria-live="polite">Loading spells…</p>}
      {query.isError && <p className="text-danger" role="alert">Spells are currently unavailable.</p>}
      {query.data && spells.length === 0 && <p>No spells match your selection.</p>}
      {spellGroups.map(({ key, label, spells: groupedSpells }) => (
        <section className="mb-6 last:mb-0" key={key}>
          <h3 className="sticky top-0 z-10 mb-3 rounded-panel border border-border bg-surface-elevated px-4 py-2.5 text-lg text-accent shadow-sm">
            {label}
          </h3>
          <ul className="m-0 grid list-none gap-3 p-0">
            {groupedSpells.map((spell) => (
              <li key={spell.id}>
                <SpellPickerItem onPreview={setPreviewedSpell} onSelect={onSelect} spell={spell} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {query.hasNextPage && (
        <button
          className="build-secondary-action mt-4 w-full"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
          type="button"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more spells"}
        </button>
      )}
    </ItemPickerLayout>
  );
}

function groupSpells(spells: Spell[]) {
  const schoolOrder = new Map<SpellSchool, number>(
    [...SORCERY_SCHOOLS, ...INCANTATION_SCHOOLS].map((school, index) => [school, index]),
  );
  const typeOrder: Record<Spell["type"], number> = { sorcery: 0, incantation: 1 };
  const groups = new Map<string, { school: SpellSchool | null; type: Spell["type"]; spells: Spell[] }>();
  for (const spell of spells) {
    const school = spell.schools[0] ?? null;
    const key = `${spell.type}:${school ?? "other"}`;
    const group = groups.get(key) ?? { school, type: spell.type, spells: [] };
    group.spells.push(spell);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .sort(([, left], [, right]) => typeOrder[left.type] - typeOrder[right.type]
      || (left.school ? schoolOrder.get(left.school) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER)
      - (right.school ? schoolOrder.get(right.school) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER))
    .map(([key, group]) => ({
      key,
      label: `${group.type === "sorcery" ? "Sorcery" : "Incantation"} · ${group.school ? formatSpellLabel(group.school) : "Other"}`,
      spells: group.spells.sort((left, right) => left.name.localeCompare(right.name)),
    }));
}
