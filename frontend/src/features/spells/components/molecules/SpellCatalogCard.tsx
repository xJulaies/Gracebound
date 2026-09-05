import type { Spell } from "../../types/spell.types";
import { formatSpellLabel } from "../../domain/formatSpellLabel";

export function SpellCatalogCard({ spell, onOpen }: {
  spell: Spell;
  onOpen: (spell: Spell) => void;
}) {
  return (
    <article className="group relative m-0 flex h-full min-w-0 flex-col overflow-hidden rounded-panel border border-border bg-surface-elevated shadow-lg shadow-background/25 transition-colors hover:border-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
      <button
        aria-label={`View details for ${spell.name}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-panel border-0 bg-transparent p-0"
        onClick={() => onOpen(spell)}
        type="button"
      />
      <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-border bg-background/45 p-6 sm:h-56 sm:p-8">
        <img
          alt=""
          aria-hidden="true"
          className="size-36 max-size-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
          src={spell.iconUrl}
        />
        <span className="absolute top-3 left-3 rounded-panel border border-border bg-surface/90 px-2 py-1 text-xs text-foreground-muted">
          {spell.type === "sorcery" ? "Sorcery" : "Incantation"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="mb-2 text-xl leading-tight wrap-break-word">{spell.name}</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          {`${spell.fpCost} FP · ${spell.slotsRequired} ${spell.slotsRequired === 1 ? "slot" : "slots"}`}
        </p>
        {spell.schools.length > 0 && (
          <p className="mb-4 text-sm text-accent">
            {spell.schools.map(formatSpellLabel).join(" · ")}
          </p>
        )}
        {spell.summary && (
          <div className="mb-4 border-l-2 border-accent pl-3">
            <p className="mb-0 text-sm leading-6 text-foreground">{spell.summary}</p>
          </div>
        )}
        <p className="mb-0 line-clamp-4 text-sm leading-6 text-foreground-muted">
          {spell.description ?? "No description is available for this spell."}
        </p>
      </div>
    </article>
  );
}
