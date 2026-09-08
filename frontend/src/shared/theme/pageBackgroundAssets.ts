import { resolveApiAssetUrl } from "../api/resolveApiAssetUrl";
import type { Theme } from "./theme";

interface ResponsiveBackgroundUrls {
  desktop: string;
  mobile: string;
}

export const PAGE_BACKGROUND_URLS: Record<Theme, ResponsiveBackgroundUrls> = {
  grace: {
    desktop: resolveApiAssetUrl("/api/assets/branding/gracebound-background-grace?v=2"),
    mobile: resolveApiAssetUrl(
      "/api/assets/branding/gracebound-background-grace-mobile?v=1",
    ),
  },
  night: {
    desktop: resolveApiAssetUrl("/api/assets/branding/gracebound-background-night?v=2"),
    mobile: resolveApiAssetUrl(
      "/api/assets/branding/gracebound-background-night-mobile?v=1",
    ),
  },
};

const preloadPromises = new Map<Theme, Promise<void>>();

export function preloadPageBackground(theme: Theme) {
  const existing = preloadPromises.get(theme);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    const useMobileVariant = window.matchMedia?.("(max-width: 47.999rem)").matches ?? false;
    image.src = useMobileVariant
      ? PAGE_BACKGROUND_URLS[theme].mobile
      : PAGE_BACKGROUND_URLS[theme].desktop;
  });
  preloadPromises.set(theme, promise);
  return promise;
}
