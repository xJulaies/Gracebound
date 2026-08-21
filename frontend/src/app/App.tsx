import { AuthControls } from "../features/auth/components/AuthControls";
import { BuildIntegrationPanel } from "../features/builds/components/BuildIntegrationPanel";
import { useHealthQuery } from "../shared/hooks/useHealthQuery";

export function App() {
  const health = useHealthQuery();

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">Backend integration client</p>
          <h1>Gracebound</h1>
        </div>
        <AuthControls />
      </header>

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
