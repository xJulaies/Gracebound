import { resolveApiAssetUrl } from "../../../../shared/api/resolveApiAssetUrl";
import { HeroActionPanel } from "../molecules/HeroActionPanel";

const MOBILE_HERO_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-hero?v=2",
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
          <source media="(min-width: 48rem)" srcSet={DESKTOP_HERO_URL} />
          <img
            alt=""
            aria-hidden="true"
            className="home-hero-image"
            src={MOBILE_HERO_URL}
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
