import { BuildIntegrationPanel } from "../../builds/components/BuildIntegrationPanel";
import { useHealthQuery } from "../../../shared/hooks/useHealthQuery";
import { CharacterClassCarousel } from "../../character-classes/components/organisms/CharacterClassCarousel";
import { HomeHero } from "./organisms/HomeHero";

export function HomePage() {
  const health = useHealthQuery();

  return (
    <main className="pt-0">
      <HomeHero />

      <div>
        <section aria-labelledby="backend-health-heading">
          <h2 id="backend-health-heading">Backend health</h2>
          {health.isPending && <p role="status">Checking backend…</p>}
          {health.isError && <p role="alert">Backend is unavailable.</p>}
          {health.data && <p className="success" role="status">{health.data.message}</p>}
        </section>

        <BuildIntegrationPanel />

        <CharacterClassCarousel />
      </div>
    </main>
  );
}
