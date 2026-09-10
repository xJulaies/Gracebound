import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { parseFrontendEnvironment } from "./src/shared/config/parseFrontendEnvironment.ts";
import { FRONTEND_SECURITY_HEADERS } from "./src/shared/config/securityHeaders.ts";

export default defineConfig(({ mode }) => {
  const environment = parseFrontendEnvironment(loadEnv(mode, ".", "VITE_"), mode);
  const apiOrigin = /^https?:\/\/[^/]+/i.exec(environment.apiUrl)?.[0];
  if (!apiOrigin) throw new Error("Validated API URL is missing its origin");

  return {
    plugins: [apiPreconnectPlugin(apiOrigin), react(), tailwindcss()],
    preview: { headers: FRONTEND_SECURITY_HEADERS },
    server: { headers: FRONTEND_SECURITY_HEADERS },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});

function apiPreconnectPlugin(apiOrigin: string): Plugin {
  return {
    name: "gracebound-api-preconnect",
    transformIndexHtml: {
      order: "pre",
      handler: () => [
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: apiOrigin,
            crossorigin: "",
          },
          injectTo: "head",
        },
      ],
    },
  };
}
