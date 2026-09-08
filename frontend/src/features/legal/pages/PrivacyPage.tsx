export function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-page-header">
        <h1>Datenschutzerklärung</h1>
        <p>Stand: 8. September 2026</p>
      </header>

      <LegalNotice />

      <LegalSection title="1. Verantwortlicher">
        <p>
          Verantwortlich für die Datenverarbeitung ist der Betreiber von Gracebound.
        </p>
        <p>
          <strong>Vor einer Veröffentlichung zu ergänzen:</strong> vollständiger Name,
          ladungsfähige Anschrift und eine erreichbare E-Mail-Adresse.
        </p>
      </LegalSection>

      <LegalSection title="2. Zweck des Projekts">
        <p>
          Gracebound ist ein nichtkommerzielles Fan- und Portfolio-Projekt. Die Anwendung
          stellt einen Build-Editor, öffentliche und private Builds sowie Informationen und
          Berechnungen zu Elden Ring bereit.
        </p>
      </LegalSection>

      <LegalSection title="3. Technische Bereitstellung und Protokolldaten">
        <p>
          Beim Aufruf der Anwendung können technisch erforderliche Daten verarbeitet werden,
          insbesondere IP-Adresse, Zeitpunkt, angeforderte Adresse, HTTP-Status, Browser- und
          Geräteinformationen. Die Verarbeitung dient der Auslieferung, Stabilität,
          Fehleranalyse und Abwehr missbräuchlicher Zugriffe.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im
          sicheren und zuverlässigen Betrieb der Anwendung. Speicherdauer und konkreter
          Hostinganbieter müssen vor einer Veröffentlichung ergänzt werden.
        </p>
      </LegalSection>

      <LegalSection title="4. Anmeldung über Clerk">
        <p>
          Für das Speichern und Verwalten eigener Builds wird der Authentifizierungsdienst
          Clerk eingesetzt. Dabei können insbesondere eine technische Benutzerkennung,
          Anmelde- und Sitzungsdaten sowie die beim gewählten Anmeldeverfahren angegebenen
          Kontodaten durch Clerk verarbeitet werden. Gracebound verwendet serverseitig die
          von Clerk bestätigte Benutzerkennung zur Zuordnung geschützter Builds.
        </p>
        <p>
          Die Verarbeitung erfolgt zur Bereitstellung der angeforderten Konto- und
          Speicherfunktionen auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Weitere Angaben
          stellt Clerk in seiner{" "}
          <a href="https://clerk.com/legal/privacy" rel="noreferrer" target="_blank">
            Datenschutzerklärung
          </a>{" "}
          bereit. Mögliche Drittlandübermittlungen und die für den konkreten Clerk-Vertrag
          geltenden Garantien müssen vor Veröffentlichung abschließend geprüft werden.
        </p>
      </LegalSection>

      <LegalSection title="5. Gespeicherte Builds und öffentliche Inhalte">
        <p>
          Bei gespeicherten Builds verarbeitet Gracebound die Clerk-Benutzerkennung, den
          Build-Namen, eine optionale Beschreibung, Charakterwerte, ausgewählte Ausrüstung,
          Zauber, Sichtbarkeit und technische Zeitstempel. Private Builds sind nur für den
          angemeldeten Eigentümer bestimmt. Als öffentlich markierte Builds sind für andere
          Besucher sichtbar.
        </p>
        <p>
          Builds werden gespeichert, bis sie durch den Eigentümer gelöscht werden oder eine
          Löschung aus rechtlichen oder technischen Gründen erforderlich ist. Nutzer sollten
          in Namen und Beschreibungen keine personenbezogenen oder vertraulichen Angaben
          veröffentlichen.
        </p>
      </LegalSection>

      <LegalSection title="6. Datenbankdienst MongoDB Atlas">
        <p>
          Anwendungs- und Spieldaten werden mit MongoDB Atlas verarbeitet. Abhängig von der
          später gewählten Region und Konfiguration kann eine Verarbeitung durch MongoDB und
          verbundene Dienstleister stattfinden. Serverregion, Auftragsverarbeitung,
          Drittlandtransfer und konkrete Löschfristen müssen vor Veröffentlichung anhand des
          eingesetzten Atlas-Vertrags dokumentiert werden.
        </p>
        <p>
          Informationen des Anbieters finden sich in der{" "}
          <a href="https://www.mongodb.com/legal/privacy-policy" rel="noreferrer" target="_blank">
            Datenschutzerklärung von MongoDB
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="7. Theme-Einstellung im Browser">
        <p>
          Die gewählte Darstellung „Grace“ oder „Night“ wird unter dem Schlüssel
          <code> gracebound-theme </code> im Local Storage des Browsers gespeichert. Dies
          dient ausschließlich dazu, die gewünschte Darstellung bei einem späteren Aufruf
          wiederherzustellen. Die Einstellung kann über die Website geändert und durch
          Löschen der Browserdaten entfernt werden.
        </p>
      </LegalSection>

      <LegalSection title="8. Google Fonts">
        <p>
          Die Schriftart Cinzel wird derzeit über Server von Google geladen. Hierbei kann die
          IP-Adresse des aufrufenden Geräts an Google übermittelt werden. Vor einer
          Veröffentlichung sollte die Schriftart lokal bereitgestellt oder die konkrete
          Verarbeitung einschließlich Rechtsgrundlage und möglicher Drittlandübermittlung
          abschließend bewertet werden.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies und ähnliche Technologien">
        <p>
          Gracebound verwendet keine eigenen Analyse- oder Werbetracker. Für Anmeldung und
          Sitzungsverwaltung kann Clerk technisch erforderliche Cookies oder vergleichbare
          Speichertechnologien einsetzen. Ob darüber hinaus eine Einwilligung erforderlich
          ist, muss anhand der dann eingesetzten Clerk- und Hostingkonfiguration vor dem
          öffentlichen Betrieb geprüft werden.
        </p>
      </LegalSection>

      <LegalSection title="10. Empfänger und Drittlandübermittlungen">
        <p>
          Daten können im erforderlichen Umfang an Clerk, MongoDB sowie den später gewählten
          Frontend- und Backend-Hoster übermittelt werden. Werden Anbieter außerhalb des
          Europäischen Wirtschaftsraums eingesetzt, muss vor Veröffentlichung dokumentiert
          werden, auf welcher Grundlage die Übermittlung erfolgt, etwa aufgrund eines
          Angemessenheitsbeschlusses oder geeigneter Garantien.
        </p>
      </LegalSection>

      <LegalSection title="11. Rechte betroffener Personen">
        <p>
          Betroffene Personen haben nach Maßgabe der DSGVO insbesondere Rechte auf Auskunft,
          Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
          Widerspruch. Erteilte Einwilligungen können mit Wirkung für die Zukunft widerrufen
          werden. Außerdem besteht ein Beschwerderecht bei einer zuständigen
          Datenschutzaufsichtsbehörde.
        </p>
        <p>
          Eine Kontaktadresse für Datenschutzanfragen und die zuständige Aufsichtsbehörde
          sind vor Veröffentlichung zu ergänzen.
        </p>
      </LegalSection>

      <LegalSection title="12. Automatisierte Entscheidungen">
        <p>
          Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling im
          Sinne von Art. 22 DSGVO statt.
        </p>
      </LegalSection>
    </main>
  );
}

function LegalNotice() {
  return (
    <aside className="rounded-panel border border-danger bg-surface p-4 text-sm leading-6">
      <strong>Entwurfsstatus:</strong> Diese Erklärung beschreibt den aktuellen technischen
      Stand. Sie ist wegen der noch offenen Betreiber-, Hosting- und Vertragsangaben nicht
      für eine öffentliche Bereitstellung fertig.
    </aside>
  );
}

function LegalSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
