import { useEffect, useState } from "react";
import {
  getActiveTheme,
  THEME_CHANGE_EVENT,
  type Theme,
} from "../../../../../shared/theme/theme";
import { PAGE_BACKGROUND_URLS } from "../../../../../shared/theme/pageBackgroundAssets";

export function PageBackground() {
  const [loadedThemes, setLoadedThemes] = useState<Set<Theme>>(
    () => new Set([getActiveTheme()]),
  );

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const theme = (event as CustomEvent<Theme>).detail;
      setLoadedThemes((current) => new Set(current).add(theme));
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  return (
    <div aria-hidden="true" className="page-background">
      {loadedThemes.has("grace") && (
        <BackgroundLayer className="page-background-grace" urls={PAGE_BACKGROUND_URLS.grace} />
      )}
      {loadedThemes.has("night") && (
        <BackgroundLayer className="page-background-night" urls={PAGE_BACKGROUND_URLS.night} />
      )}
    </div>
  );
}

function BackgroundLayer({
  className,
  urls,
}: {
  className: string;
  urls: { desktop: string; mobile: string };
}) {
  return (
    <div className={`page-background-layer ${className}`}>
      <picture className="block size-full">
        <source media="(max-width: 47.999rem)" srcSet={urls.mobile} />
        <img
          alt=""
          className="size-full object-cover object-top"
          decoding="async"
          src={urls.desktop}
        />
      </picture>
      <span className="page-background-dimmer" />
    </div>
  );
}
