export const THEMES = ["grace", "night"] as const;

export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "gracebound-theme";

export function resolveTheme(
  storedTheme: string | null,
  prefersDark: boolean,
): Theme {
  if (storedTheme === "grace" || storedTheme === "night") {
    return storedTheme;
  }
  return prefersDark ? "night" : "grace";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function getActiveTheme(): Theme {
  return document.documentElement.dataset.theme === "grace" ? "grace" : "night";
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initializeTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = resolveTheme(localStorage.getItem(STORAGE_KEY), prefersDark);
  applyTheme(theme);
  return theme;
}
