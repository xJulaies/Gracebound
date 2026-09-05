import { BuildCreationCallout } from "../components/molecules/BuildCreationCallout";
import { PublicBuildGallery } from "../components/organisms/PublicBuildGallery";

export function BuildsPage() {
  return (
    <main className="app-shell">
      <BuildCreationCallout />
      <PublicBuildGallery />
    </main>
  );
}
