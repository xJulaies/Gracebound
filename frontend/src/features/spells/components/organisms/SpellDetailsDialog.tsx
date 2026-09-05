import { useRef } from "react";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import type { Spell } from "../../types/spell.types";
import { formatSpellLabel } from "../../domain/formatSpellLabel";
import { SpellDetailsContent } from "../molecules/SpellDetailsContent";

export function SpellDetailsDialog({ spell, onClose }: {
  spell: Spell;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: closeButtonRef, onClose });
  const type = spell.type === "sorcery" ? "Sorcery" : "Incantation";
  const schools = spell.schools.map(formatSpellLabel).join(" · ");

  return (
    <div className="fixed inset-0 z-50 bg-background/75" role="presentation">
      <button
        aria-label="Close spell details"
        className="absolute inset-0 cursor-default rounded-none border-0 bg-transparent"
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={`${spell.name} details dialog`}
        aria-modal="true"
        className="relative z-10 flex h-full w-full justify-center lg:items-center lg:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <ItemDetailsPreview
          closeButtonRef={closeButtonRef}
          description={spell.description ?? spell.summary}
          iconUrl={spell.iconUrl}
          onClose={onClose}
          subtitle={[type, schools].filter(Boolean).join(" · ")}
          title={spell.name}
        >
          <SpellDetailsContent spell={spell} />
        </ItemDetailsPreview>
      </div>
    </div>
  );
}
