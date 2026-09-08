import { Link } from "@tanstack/react-router";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="app-shell flex flex-col gap-3 py-6 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span>© 2026 Gracebound</span>
          <span>Unofficial, non-commercial fan and portfolio project</span>
        </div>
        <nav aria-label="Legal information" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/imprint">Impressum</Link>
          <Link to="/privacy">Datenschutz</Link>
        </nav>
      </div>
    </footer>
  );
}
