import { Outlet } from "@tanstack/react-router";
import { PublicFooter } from "./components/organisms/PublicFooter";
import { PublicHeader } from "./components/organisms/PublicHeader";
import { SkipLink } from "./components/atoms/SkipLink";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <PublicHeader />
      <div className="app-shell flex-1" id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}
