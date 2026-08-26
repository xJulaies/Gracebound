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
  SUPPORTED_GAME_VERSION: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.10.0"),
  ERDB_BASE_URL: z.url().default("http://127.0.0.1:8107/v1"),
});

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
