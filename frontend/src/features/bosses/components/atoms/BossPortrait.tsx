interface BossPortraitProps {
  bossName: string;
  className?: string;
  imageUrl: string | null;
  showImpact?: boolean;
}

export function BossPortrait({ bossName, className = "", imageUrl, showImpact = false }: BossPortraitProps) {
  return (
    <div
      aria-label={`${bossName} portrait`}
      className={`boss-portrait ${className}`.trim()}
      data-impact={showImpact}
      role="img"
    >
      {imageUrl ? (
        <img alt="" className="boss-portrait__image" decoding="async" src={imageUrl} />
      ) : (
        <span aria-hidden="true">{getInitials(bossName)}</span>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}
