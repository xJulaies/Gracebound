const DEFAULT_API_URL = "http://localhost:3000/api";

interface FrontendEnvironmentInput {
  [key: string]: unknown;
}

interface FrontendEnvironment {
  apiUrl: string;
  clerkPublishableKey: string | null;
}

export function parseFrontendEnvironment(
  input: FrontendEnvironmentInput,
  mode: string,
): FrontendEnvironment {
  const isProduction = mode === "production";
  const apiUrlInput = readOptionalString(input.VITE_API_URL);
  const clerkPublishableKey = readOptionalString(
    input.VITE_CLERK_PUBLISHABLE_KEY,
  ) ?? null;
  const invalidFields: string[] = [];

  if (isProduction && !apiUrlInput) {
    invalidFields.push("VITE_API_URL");
  }

  const apiUrl = validateApiUrl(apiUrlInput || DEFAULT_API_URL, isProduction);
  if (!apiUrl) invalidFields.push("VITE_API_URL");

  if (clerkPublishableKey && !clerkPublishableKey.startsWith("pk_")) {
    invalidFields.push("VITE_CLERK_PUBLISHABLE_KEY");
  } else if (isProduction && !clerkPublishableKey?.startsWith("pk_live_")) {
    invalidFields.push("VITE_CLERK_PUBLISHABLE_KEY");
  }

  const uniqueInvalidFields = [...new Set(invalidFields)];
  if (uniqueInvalidFields.length > 0 || !apiUrl) {
    throw new Error(
      `Invalid frontend environment configuration: ${uniqueInvalidFields.join(", ")}`,
    );
  }

  return {
    apiUrl,
    clerkPublishableKey,
  };
}

function validateApiUrl(value: string, requireHttps: boolean): string | null {
  const match = /^(https?):\/\/([^/?#\s]+)(\/[^?#\s]*)?$/i.exec(value);
  if (!match || match[2].includes("@")) return null;
  if (requireHttps && match[1].toLowerCase() !== "https") return null;
  return value.replace(/\/$/, "");
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() || undefined;
}
