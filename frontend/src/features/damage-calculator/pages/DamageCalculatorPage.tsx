import { DamageTrialWorkspace } from "../components/organisms/DamageTrialWorkspace";

export function DamageCalculatorPage() {
  return (
    <main className="damage-trial-page grid gap-8">
      <header className="tarnished-records-hero text-center">
        <h1 className="mb-3 text-3xl sm:text-5xl">Damage Trial</h1>
        <p className="mx-auto mb-0 max-w-3xl leading-7 text-foreground-muted">
          Pit a recorded build against an enemy, perform each attack by hand, and inspect every point of damage.
        </p>
      </header>
      <section className="damage-trial-panel" aria-label="Damage trial setup">
        <DamageTrialWorkspace />
      </section>
    </main>
  );
}
