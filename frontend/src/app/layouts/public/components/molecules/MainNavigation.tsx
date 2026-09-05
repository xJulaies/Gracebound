import { Link } from "@tanstack/react-router";

const NAVIGATION_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Equipment", to: "/equipment" },
  { label: "Spells", to: "/spells" },
  { label: "Bosses", to: "/bosses" },
  { label: "Builds", to: "/builds" },
  { label: "Damage Calculator", to: "/damage-calculator" },
] as const;

export function MainNavigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={mobile ? "flex flex-col gap-1" : "hidden items-center gap-5 lg:flex"}
    >
      {NAVIGATION_ITEMS.map(({ label, to }) => (
        <Link
          activeOptions={{ exact: to === "/" }}
          activeProps={{ "aria-current": "page", className: "active" }}
          className={mobile ? "rounded-panel px-3 py-3" : "py-2"}
          key={to}
          onClick={onNavigate}
          to={to}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
