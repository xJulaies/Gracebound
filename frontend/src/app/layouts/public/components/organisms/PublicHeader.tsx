import { useState } from "react";
import { AuthControls } from "../../../../../features/auth/components/AuthControls";
import { ThemeToggle } from "../../../../../shared/ui/ThemeToggle";
import { MenuButton } from "../atoms/MenuButton";
import { BrandLink } from "../molecules/BrandLink";
import { MainNavigation } from "../molecules/MainNavigation";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <div className="app-shell flex min-h-20 items-center justify-between gap-5 py-3">
        <BrandLink />
        <MainNavigation />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden lg:block">
            <AuthControls />
          </div>
          <MenuButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          />
        </div>
      </div>

      {isMenuOpen && (
        <MobileNavigationDrawer
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
