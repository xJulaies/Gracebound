import { useState } from "react";
import {
  getActiveTheme,
  saveTheme,
  type Theme,
} from "../theme/theme";
import { preloadPageBackground } from "../theme/pageBackgroundAssets";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getActiveTheme);
  const nextTheme = theme === "night" ? "grace" : "night";

  function prepareNextBackground() {
    void preloadPageBackground(nextTheme);
  }

  function toggleTheme() {
    void preloadPageBackground(nextTheme);
    saveTheme(nextTheme, true);
    setTheme(nextTheme);
  }

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "night"}
      className="inline-flex items-center gap-2 border-border bg-surface px-3 py-2 text-sm text-foreground-muted hover:border-moon hover:text-foreground"
      onClick={toggleTheme}
      onFocus={prepareNextBackground}
      onPointerEnter={prepareNextBackground}
      type="button"
    >
      <span aria-hidden="true">{theme === "night" ? "☾" : "✦"}</span>
      <span className="hidden sm:inline">
        {theme === "night" ? "Night" : "Grace"}
      </span>
    </button>
  );
}
