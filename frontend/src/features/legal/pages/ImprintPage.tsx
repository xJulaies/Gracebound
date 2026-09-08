import { Link } from "@tanstack/react-router";

export function ImprintPage() {
  return (
    <main className="legal-page">
      <header className="legal-page-header">
        <h1>Impressum</h1>
        <p>Anbieterkennzeichnung für Gracebound</p>
      </header>

      <aside className="rounded-panel border border-danger bg-surface p-4 text-sm leading-6">
        <strong>Vor einer Veröffentlichung zu vervollständigen:</strong> Die gesetzlich
        erforderlichen Betreiber- und Kontaktdaten dürfen nicht durch Platzhalter ersetzt
        bleiben.
      </aside>

      <section>
        <h2>Angaben zum Betreiber</h2>
        <p>[Vollständiger Name]</p>
        <p>[Ladungsfähige Anschrift]</p>
        <p>E-Mail: [Erreichbare Kontaktadresse]</p>
      </section>

      <section>
        <h2>Projektstatus</h2>
        <p>
          Gracebound ist ein privates, nichtkommerzielles Fan- und Portfolio-Projekt. Es
          besteht keine Verbindung, Partnerschaft oder offizielle Unterstützung durch
          FromSoftware oder Bandai Namco Entertainment.
        </p>
      </section>

      <section>
        <h2>Marken und Inhalte Dritter</h2>
        <p>
          ELDEN RING und damit verbundene Bezeichnungen, Marken, Bilder und Spielinhalte sind
          Eigentum ihrer jeweiligen Rechteinhaber. Eigene Inhalte und Quellcode von
          Gracebound begründen keine Rechte an diesen Inhalten Dritter.
        </p>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten enthält die{" "}
          <Link to="/privacy">Datenschutzerklärung</Link>.
        </p>
      </section>
    </main>
  );
}
