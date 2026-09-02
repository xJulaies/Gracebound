export function CarouselArrowButton({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) {
  const isPrevious = direction === "previous";

  return (
    <button
      aria-label={`${isPrevious ? "Previous" : "Next"} class`}
      onClick={onClick}
      type="button"
    >
      {isPrevious ? "←" : "→"}
    </button>
  );
}
