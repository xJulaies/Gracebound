export const THEMES = ["grace", "night"] as const;

export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "gracebound-theme";
const THEME_TRANSITION_CLASS = "theme-transitioning";
const THEME_TRANSITION_DURATION_MS = 500;
let transitionTimeout: number | undefined;

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

export function saveTheme(theme: Theme, animate = false) {
  localStorage.setItem(STORAGE_KEY, theme);

  if (animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    const root = document.documentElement;
    window.clearTimeout(transitionTimeout);
    root.classList.add(THEME_TRANSITION_CLASS);
    void root.offsetWidth;
    transitionTimeout = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
      transitionTimeout = undefined;
    }, THEME_TRANSITION_DURATION_MS);
  }

  applyTheme(theme);
}

export function initializeTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = resolveTheme(localStorage.getItem(STORAGE_KEY), prefersDark);
  applyTheme(theme);
  return theme;
}
