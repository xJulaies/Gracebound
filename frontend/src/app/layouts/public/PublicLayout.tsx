import { Outlet } from "@tanstack/react-router";
import { PublicFooter } from "./components/organisms/PublicFooter";
import { PublicHeader } from "./components/organisms/PublicHeader";
import { PageBackground } from "./components/atoms/PageBackground";
import { SkipLink } from "./components/atoms/SkipLink";

export function PublicLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <PageBackground />
      <SkipLink />
      <PublicHeader />
      <div className="app-shell flex-1" id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}
