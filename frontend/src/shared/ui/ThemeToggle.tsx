import { useState } from "react";
import {
  getActiveTheme,
  saveTheme,
  type Theme,
} from "../theme/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getActiveTheme);
  const nextTheme = theme === "night" ? "grace" : "night";

  function toggleTheme() {
    saveTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "night"}
      className="inline-flex items-center gap-2 border-border bg-surface px-3 py-2 text-sm text-foreground-muted hover:border-moon hover:text-foreground"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true">{theme === "night" ? "☾" : "✦"}</span>
      <span className="hidden sm:inline">
        {theme === "night" ? "Night" : "Grace"}
      </span>
    </button>
  );
}
