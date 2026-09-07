interface Rectangle {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

export function calculateFloatingPreviewPosition({
  anchor,
  container,
  preview,
  rootFontSize,
  viewportHeight,
  viewportWidth,
}: {
  anchor: Rectangle;
  container?: Rectangle;
  preview: Rectangle;
  rootFontSize: number;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const gap = rootFontSize * 0.5;
  const margin = rootFontSize * 1.5;
  const leftBoundary = Math.max(margin, container ? container.left + margin : margin);
  const rightBoundary = Math.min(
    viewportWidth - margin,
    container ? container.right - margin : viewportWidth - margin,
  );
  const topBoundary = Math.max(margin, container ? container.top + margin : margin);
  const bottomBoundary = Math.min(
    viewportHeight - margin,
    container ? container.bottom - margin : viewportHeight - margin,
  );
  const centeredLeft = anchor.left + (anchor.width - preview.width) / 2;
  const left = clamp(centeredLeft, leftBoundary, Math.max(leftBoundary, rightBoundary - preview.width));
  const fitsAbove = anchor.top - gap - preview.height >= topBoundary;
  const preferredTop = fitsAbove ? anchor.top - gap - preview.height : anchor.bottom + gap;
  const top = clamp(preferredTop, topBoundary, Math.max(topBoundary, bottomBoundary - preview.height));
  return { left, top };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
