import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <div className="app-shell">
      <main>
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
      </main>
    </div>
  ),
});
