import { parseFrontendEnvironment } from "./parseFrontendEnvironment";

const environment = parseFrontendEnvironment(import.meta.env, import.meta.env.MODE);

export const API_URL = environment.apiUrl;

export function getClerkPublishableKey() {
  const publishableKey = environment.clerkPublishableKey;

  if (!publishableKey) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY is missing");
  }

  return publishableKey;
}
