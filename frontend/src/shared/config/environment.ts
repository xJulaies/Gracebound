const DEFAULT_API_URL = "http://localhost:3000/api";

export const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, "");

export function getClerkPublishableKey() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY is missing");
  }

  return publishableKey;
}
