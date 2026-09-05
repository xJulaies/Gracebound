export function DrawerBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Close navigation"
      className="fixed inset-0 z-40 rounded-none border-0 bg-background/75 p-0 backdrop-blur-xs lg:hidden"
      onClick={onClick}
      type="button"
    />
  );
}
