import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.url().default("http://localhost:5173"),
  MONGODB_URL: z
    .string()
    .regex(/^mongodb(?:\+srv)?:\/\//, "Must be a MongoDB connection URL"),
  CLERK_PUBLISHABLE_KEY: z.string().startsWith("pk_").min(1),
  CLERK_SECRET_KEY: z.string().startsWith("sk_").min(1),
  MAX_BUILDS_PER_USER: z.coerce.number().int().min(1).max(1_000).default(100),
  SUPPORTED_GAME_VERSION: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.17.0"),
  ERDB_BASE_URL: z.url().default("http://127.0.0.1:8107/v1"),
}).superRefine((environment, context) => {
  if (!URL.canParse(environment.CORS_ORIGIN)) {
    return;
  }

  const corsOrigin = new URL(environment.CORS_ORIGIN);

  if (corsOrigin.origin !== environment.CORS_ORIGIN) {
    context.addIssue({
      code: "custom",
      path: ["CORS_ORIGIN"],
      message: "Must contain only an origin without a path or trailing slash",
    });
  }

  if (environment.NODE_ENV !== "production") {
    return;
  }

  if (corsOrigin.protocol !== "https:") {
    context.addIssue({
      code: "custom",
      path: ["CORS_ORIGIN"],
      message: "Must use HTTPS in production",
    });
  }

  if (!usesEncryptedMongoConnection(environment.MONGODB_URL)) {
    context.addIssue({
      code: "custom",
      path: ["MONGODB_URL"],
      message: "Must use an encrypted MongoDB connection in production",
    });
  }

  if (!environment.CLERK_PUBLISHABLE_KEY.startsWith("pk_live_")) {
    context.addIssue({
      code: "custom",
      path: ["CLERK_PUBLISHABLE_KEY"],
      message: "Must use a live Clerk publishable key in production",
    });
  }

  if (!environment.CLERK_SECRET_KEY.startsWith("sk_live_")) {
    context.addIssue({
      code: "custom",
      path: ["CLERK_SECRET_KEY"],
      message: "Must use a live Clerk secret key in production",
    });
  }
});

function usesEncryptedMongoConnection(connectionUrl: string): boolean {
  return connectionUrl.startsWith("mongodb+srv://")
    || /[?&](?:tls|ssl)=true(?:&|$)/i.test(connectionUrl);
}

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(input: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const invalidFields = [
      ...new Set(
        result.error.issues.map((issue) => String(issue.path[0] ?? "unknown")),
      ),
    ];

    throw new Error(
      `Invalid environment configuration: ${invalidFields.join(", ")}`,
    );
  }

  return result.data;
}
