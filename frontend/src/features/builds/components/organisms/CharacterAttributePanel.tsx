import type { CharacterClass } from "../../../character-classes/types/characterClass.types";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { AttributeControl } from "../molecules/AttributeControl";

const attributes = [
  "vigor",
  "mind",
  "endurance",
  "strength",
  "dexterity",
  "intelligence",
  "faith",
  "arcane",
] as const satisfies readonly (keyof CharacterStats)[];

interface CharacterAttributePanelProps {
  characterClass: CharacterClass;
  characterLevel: number;
  isUpdatingCosts: boolean;
  nextLevelRuneCost: number | null;
  onChangeAttribute: (attribute: keyof CharacterStats, value: number) => void;
  onChangeCharacter: () => void;
  stats: CharacterStats;
  totalRuneCost: number | null;
}

export function CharacterAttributePanel({
  characterClass,
  characterLevel,
  isUpdatingCosts,
  nextLevelRuneCost,
  onChangeAttribute,
  onChangeCharacter,
  stats,
  totalRuneCost,
}: CharacterAttributePanelProps) {
  const investedLevels = characterLevel - characterClass.level;

  return (
    <aside aria-labelledby="character-attributes-heading" className="build-editor-panel min-w-0">
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-panel border border-accent">
        <img
          alt={`${characterClass.name} starting class`}
          className="size-full object-cover object-top"
          src={characterClass.imageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="mb-0 text-2xl" id="character-attributes-heading">
            {characterClass.name}
          </h2>
          <p className="mb-0 text-sm text-foreground-muted">Level {characterLevel}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-foreground-muted">Invested levels</span>
        <strong className="font-heading text-accent">{investedLevels}</strong>
      </div>
      <dl
        aria-busy={isUpdatingCosts}
        className="mb-4 rounded-panel border border-border bg-background/45 px-3"
      >
        <RuneCostRow
          label="Next level"
          value={nextLevelRuneCost === null ? "—" : formatRunes(nextLevelRuneCost)}
        />
        <RuneCostRow
          label="Total invested"
          value={totalRuneCost === null ? "—" : formatRunes(totalRuneCost)}
        />
        {isUpdatingCosts && (
          <span className="sr-only" aria-live="polite">Updating rune costs</span>
        )}
      </dl>

      <div>
        {attributes.map((attribute) => (
          <AttributeControl
            attribute={attribute}
            key={attribute}
            minimum={characterClass.stats[attribute]}
            onChange={onChangeAttribute}
            value={stats[attribute]}
          />
        ))}
      </div>

      <p className="mt-4 mb-0 text-xs leading-5 text-foreground-muted">
        Hold Shift while using + or − to change five levels at once.
      </p>
      <button className="build-secondary-action mt-4 w-full" onClick={onChangeCharacter} type="button">
        Change character
      </button>
    </aside>
  );
}

function RuneCostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2 text-sm last:border-b-0">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="m-0 font-heading text-accent">{value}</dd>
    </div>
  );
}

function formatRunes(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
