import type { KeyboardEvent } from "react";

export type BuildEditorTab = "character" | "equipment" | "status";

const tabs: Array<{ id: BuildEditorTab; label: string }> = [
  { id: "character", label: "Leveling" },
  { id: "equipment", label: "Equipment" },
  { id: "status", label: "Status" },
];

interface BuildEditorTabsProps {
  activeTab: BuildEditorTab;
  onChange: (tab: BuildEditorTab) => void;
}

export function BuildEditorTabs({ activeTab, onChange }: BuildEditorTabsProps) {
  const selectAndFocus = (tab: BuildEditorTab) => {
    onChange(tab);
    document.getElementById(`build-editor-${tab}-tab`)?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: BuildEditorTab,
  ) => {
    const currentIndex = tabs.findIndex(({ id }) => id === currentTab);
    const nextIndex = getNextTabIndex(event.key, currentIndex);
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) selectAndFocus(nextTab.id);
  };

  return (
    <div
      aria-label="Build editor sections"
      aria-orientation="horizontal"
      className="build-editor-tabs"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          aria-controls={`build-editor-${tab.id}-panel`}
          aria-selected={activeTab === tab.id}
          className="build-editor-tab"
          id={`build-editor-${tab.id}-tab`}
          key={tab.id}
          onKeyDown={(event) => handleKeyDown(event, tab.id)}
          onClick={() => onChange(tab.id)}
          role="tab"
          tabIndex={activeTab === tab.id ? 0 : -1}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function getNextTabIndex(key: string, currentIndex: number) {
  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % tabs.length;
    case "ArrowLeft":
      return (currentIndex - 1 + tabs.length) % tabs.length;
    case "Home":
      return 0;
    case "End":
      return tabs.length - 1;
    default:
      return null;
  }
}
