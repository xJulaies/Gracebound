import type { Spell } from "../../../spells/types/spell.types";

export function BuffToggle({
  active,
  disabled = false,
  description,
  onToggle,
  spell,
}: {
  active: boolean;
  disabled?: boolean;
  description?: string;
  onToggle: () => void;
  spell: Spell;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-w-0 items-center gap-3 rounded-panel border p-3 text-left transition-colors ${
        active ? "border-accent bg-accent/10" : "border-border bg-background/40 hover:border-accent/70"
      } disabled:cursor-not-allowed disabled:opacity-55`}
      disabled={disabled}
      onClick={onToggle}
      type="button"
    >
      <img alt="" aria-hidden="true" className="size-10 shrink-0 object-contain" src={spell.iconUrl} />
      <span className="min-w-0">
        <strong className="block truncate font-heading text-sm text-foreground">{spell.name}</strong>
        <span className="block text-xs text-foreground-muted">
          {description ?? `${formatLabel(spell.buffEffect?.slot ?? "unsupported")} · ${spell.buffEffect?.durationSeconds ?? 0}s`}
        </span>
      </span>
    </button>
  );
}

function formatLabel(value: string) {
  return value[0]?.toUpperCase() + value.slice(1);
}
