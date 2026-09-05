import { Link } from "@tanstack/react-router";

export function HeroActionPanel() {
  return (
    <div className="hero-action-panel" data-testid="hero-action-panel">
      <div className="hero-action-copy">
        <h2 className="hero-action-heading">
          Forge a build worthy of the Elden Ring
        </h2>
        <p className="hero-action-description">
          Choose your origin, refine your attributes, and prepare your build for
          the enemies ahead.
        </p>
      </div>

      <Link
        className="hero-action-link"
        to="/builds"
      >
        Forge your build
      </Link>
    </div>
  );
}
