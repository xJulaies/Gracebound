import { BuildIntegrationPanel } from "../../builds/components/BuildIntegrationPanel";
import { useHealthQuery } from "../../../shared/hooks/useHealthQuery";

export function HomePage() {
  const health = useHealthQuery();

  return (
    <main>
      <h1>Backend workspace</h1>

      <section aria-labelledby="backend-health-heading">
        <h2 id="backend-health-heading">Backend health</h2>
        {health.isPending && <p>Checking backend…</p>}
        {health.isError && <p role="alert">Backend is unavailable.</p>}
        {health.data && <p className="success">{health.data.message}</p>}
      </section>

      <BuildIntegrationPanel />
    </main>
  );
}
