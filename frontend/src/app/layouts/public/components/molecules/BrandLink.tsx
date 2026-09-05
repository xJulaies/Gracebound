import { Link } from "@tanstack/react-router";
import { resolveApiAssetUrl } from "../../../../../shared/api/resolveApiAssetUrl";

const NAVBAR_LOGO_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-navbar-logo",
);

export function BrandLink() {
  return (
    <Link className="brand shrink-0" to="/">
      <img
        alt="Gracebound — Elden Ring companion"
        className="h-auto w-44 rounded-panel sm:w-52"
        src={NAVBAR_LOGO_URL}
      />
    </Link>
  );
}
