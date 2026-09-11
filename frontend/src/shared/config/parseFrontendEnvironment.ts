import { z } from "zod";

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
  const schema = createFrontendEnvironmentSchema(isProduction);
  const result = schema.safeParse(input);

  if (!result.success) {
    const invalidFields = [...new Set(result.error.issues.map(
      ({ path }) => String(path[0] ?? "environment"),
    ))];
    throw new Error(
      `Invalid frontend environment configuration: ${invalidFields.join(", ")}`,
    );
  }

  return result.data;
}

const optionalTrimmedStringSchema = z.preprocess(
  (value) => typeof value === "string" ? value.trim() || undefined : undefined,
  z.string().optional(),
);

function createFrontendEnvironmentSchema(isProduction: boolean) {
  return z.object({
    VITE_API_URL: optionalTrimmedStringSchema,
    VITE_CLERK_PUBLISHABLE_KEY: optionalTrimmedStringSchema,
  }).superRefine((environment, context) => {
    const apiUrl = environment.VITE_API_URL;
    if (isProduction && !apiUrl) {
      context.addIssue({ code: "custom", path: ["VITE_API_URL"], message: "Required in production" });
    } else if (apiUrl && !isValidApiUrl(apiUrl, isProduction)) {
      context.addIssue({ code: "custom", path: ["VITE_API_URL"], message: "Invalid API URL" });
    }

    const clerkKey = environment.VITE_CLERK_PUBLISHABLE_KEY;
    if (clerkKey && !clerkKey.startsWith("pk_")) {
      context.addIssue({ code: "custom", path: ["VITE_CLERK_PUBLISHABLE_KEY"], message: "Invalid Clerk key" });
    } else if (isProduction && !clerkKey?.startsWith("pk_live_")) {
      context.addIssue({ code: "custom", path: ["VITE_CLERK_PUBLISHABLE_KEY"], message: "Live key required" });
    }
  }).transform((environment) => ({
    apiUrl: (environment.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ""),
    clerkPublishableKey: environment.VITE_CLERK_PUBLISHABLE_KEY ?? null,
  }));
}

function isValidApiUrl(value: string, requireHttps: boolean): boolean {
  const match = /^(https?):\/\/([^/?#\s]+)(\/[^?#\s]*)?$/i.exec(value);
  if (!match || match[2]?.includes("@")) return false;
  return !requireHttps || match[1]?.toLowerCase() === "https";
}
