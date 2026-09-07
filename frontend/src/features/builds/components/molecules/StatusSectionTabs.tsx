import type { KeyboardEvent } from "react";

export type StatusSection = "offense" | "defense" | "resistances";

const sections: Array<{ id: StatusSection; label: string }> = [
  { id: "offense", label: "Offense" },
  { id: "defense", label: "Defense" },
  { id: "resistances", label: "Resistances" },
];

export function StatusSectionTabs({
  activeSection,
  onChange,
}: {
  activeSection: StatusSection;
  onChange: (section: StatusSection) => void;
}) {
  const selectAndFocus = (section: StatusSection) => {
    onChange(section);
    document.getElementById(`status-${section}-tab`)?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentSection: StatusSection,
  ) => {
    const currentIndex = sections.findIndex(({ id }) => id === currentSection);
    const nextIndex = getNextIndex(event.key, currentIndex);
    if (nextIndex === null) return;
    event.preventDefault();
    const nextSection = sections[nextIndex];
    if (nextSection) selectAndFocus(nextSection.id);
  };

  return (
    <div aria-label="Status categories" className="mb-4 grid grid-cols-3 rounded-panel border border-border bg-background/45 p-1" role="tablist">
      {sections.map(({ id, label }) => (
        <button
          aria-controls={`status-${id}-panel`}
          aria-selected={activeSection === id}
          className="build-editor-tab"
          id={`status-${id}-tab`}
          key={id}
          onClick={() => onChange(id)}
          onKeyDown={(event) => handleKeyDown(event, id)}
          role="tab"
          tabIndex={activeSection === id ? 0 : -1}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function getNextIndex(key: string, currentIndex: number) {
  switch (key) {
    case "ArrowRight": return (currentIndex + 1) % sections.length;
    case "ArrowLeft": return (currentIndex - 1 + sections.length) % sections.length;
    case "Home": return 0;
    case "End": return sections.length - 1;
    default: return null;
  }
}
