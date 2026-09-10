import { PublicBuildGallery } from "../../builds/components/organisms/PublicBuildGallery";
import { HomeHero } from "./organisms/HomeHero";
import { FanProjectDisclaimer } from "../../legal/components/molecules/FanProjectDisclaimer";

export function HomePage() {
  return (
    <main className="pt-0">
      <HomeHero />
      <FanProjectDisclaimer />
      <PublicBuildGallery />
    </main>
  );
}
