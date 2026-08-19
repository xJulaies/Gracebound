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
