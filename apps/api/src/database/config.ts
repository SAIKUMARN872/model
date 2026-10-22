import { z } from "zod";

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z.string().trim().min(1).refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "postgres:" || parsed.protocol === "postgresql:";
    } catch {
      return false;
    }
  }, "DATABASE_URL must be a valid PostgreSQL connection URL"),

  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_IDLE_TIMEOUT_MS: z.coerce.number().int().min(0).max(600000).default(30000),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(250).max(120000).default(5000),
  DATABASE_SSL: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly maxConnections: number;
  readonly idleTimeoutMillis: number;
  readonly connectionTimeoutMillis: number;
  readonly ssl: boolean;
}

export function loadDatabaseConfig(
  source: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  const result = databaseEnvironmentSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "database"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid ModelNow database configuration:\n${details}`);
  }

  return Object.freeze({
    connectionString: result.data.DATABASE_URL,
    maxConnections: result.data.DATABASE_POOL_MAX,
    idleTimeoutMillis: result.data.DATABASE_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: result.data.DATABASE_CONNECTION_TIMEOUT_MS,
    ssl: result.data.DATABASE_SSL,
  });
}
