import { Link, Outlet } from "@tanstack/react-router";
import { AuthControls } from "../features/auth/components/AuthControls";
import { ThemeToggle } from "../shared/ui/ThemeToggle";

export function AppShell() {
  return (
    <div className="app-shell">
      <header>
        <Link className="brand" to="/">
          <span className="eyebrow">Elden Ring companion</span>
          <span className="brand-name">Gracebound</span>
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <AuthControls />
        </div>
      </header>

      <nav aria-label="Main navigation">
        <Link activeOptions={{ exact: true }} activeProps={{ className: "active" }} to="/">
          Home
        </Link>
        <Link activeProps={{ className: "active" }} to="/weapons">
          Weapons
        </Link>
        <Link activeProps={{ className: "active" }} to="/bosses">
          Bosses
        </Link>
        <Link activeProps={{ className: "active" }} to="/builds">
          Builds
        </Link>
        <Link activeProps={{ className: "active" }} to="/damage-calculator">
          Damage Calculator
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
