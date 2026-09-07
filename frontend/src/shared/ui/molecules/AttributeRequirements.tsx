import type { CharacterStats } from "../../types/game.types";
import {
  getAttributeRequirementEntries,
  type AttributeRequirementsValue,
} from "../../domain/attributeRequirements";

interface AttributeRequirementsProps {
  requirements: AttributeRequirementsValue;
  currentStats?: CharacterStats | null;
  emptyMessage?: string;
}

export function AttributeRequirements({
  requirements,
  currentStats = null,
  emptyMessage = "No attribute requirements.",
}: AttributeRequirementsProps) {
  const entries = getAttributeRequirementEntries(requirements, currentStats);

  if (entries.length === 0) {
    return <p className="mb-0 text-sm text-foreground-muted">{emptyMessage}</p>;
  }

  return (
    <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {entries.map(({ attribute, required, current, isMet }) => (
        <div className="flex justify-between gap-3 border-b border-border/60 py-1" key={attribute}>
          <dt className="text-foreground-muted">{formatAttribute(attribute)}</dt>
          <dd
            className={`m-0 ${isMet === false ? "text-danger" : isMet === true ? "text-success" : "text-foreground"}`}
          >
            {current === undefined ? required : `${current} / ${required}`}
            {isMet !== null && <span className="sr-only"> {isMet ? "requirement met" : "requirement not met"}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatAttribute(attribute: keyof CharacterStats) {
  return attribute[0].toUpperCase() + attribute.slice(1);
}
