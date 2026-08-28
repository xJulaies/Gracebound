import { createRootRoute } from "@tanstack/react-router";
import { AppShell } from "../app/AppShell";

export const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: () => (
    <main>
      <h1>Page not found</h1>
      <p>The requested page does not exist.</p>
    </main>
  ),
});
