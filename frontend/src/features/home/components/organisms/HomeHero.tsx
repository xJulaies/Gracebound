import { resolveApiAssetUrl } from "../../../../shared/api/resolveApiAssetUrl";
import { HeroActionPanel } from "../molecules/HeroActionPanel";

const MOBILE_HERO_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-hero-mobile?v=1",
);
const DESKTOP_HERO_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-hero-desktop?v=2",
);

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="home-hero relative mt-0 overflow-hidden border-x-0 border-border bg-background p-0"
    >
      <div className="home-hero-artwork overflow-hidden">
        <picture>
          <source
            height={1152}
            media="(min-width: 48rem)"
            srcSet={DESKTOP_HERO_URL}
            width={2048}
          />
          <img
            alt=""
            aria-hidden="true"
            className="home-hero-image"
            decoding="async"
            fetchPriority="high"
            height={667}
            src={MOBILE_HERO_URL}
            width={480}
          />
        </picture>
      </div>
      <h1 className="sr-only" id="home-hero-heading">
        Gracebound Elden Ring companion
      </h1>
      <HeroActionPanel />
    </section>
  );
}
