import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

const DEFAULT_API_URL = "http://localhost:3000/api";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, ".", "");
  const apiOrigin = resolveHttpOrigin(environment.VITE_API_URL || DEFAULT_API_URL);

  return {
    plugins: [apiPreconnectPlugin(apiOrigin), react(), tailwindcss()],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});

function resolveHttpOrigin(apiUrl: string) {
  const origin = /^https?:\/\/[^/]+/i.exec(apiUrl)?.[0];
  if (!origin) throw new Error("VITE_API_URL must be an absolute HTTP(S) URL");
  return origin;
}

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
