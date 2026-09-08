import { resolveApiAssetUrl } from "../../../../../shared/api/resolveApiAssetUrl";

const GRACE_BACKGROUND_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-background-grace?v=2",
);
const NIGHT_BACKGROUND_URL = resolveApiAssetUrl(
  "/api/assets/branding/gracebound-background-night?v=2",
);

export function PageBackground() {
  return (
    <div aria-hidden="true" className="page-background">
      <BackgroundLayer className="page-background-grace" src={GRACE_BACKGROUND_URL} />
      <BackgroundLayer className="page-background-night" src={NIGHT_BACKGROUND_URL} />
    </div>
  );
}

function BackgroundLayer({ className, src }: { className: string; src: string }) {
  return (
    <div className={`page-background-layer ${className}`}>
      <img alt="" className="size-full object-cover object-top" src={src} />
      <span className="page-background-dimmer" />
    </div>
  );
}
