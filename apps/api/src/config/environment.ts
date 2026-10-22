import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().trim().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().trim().min(1).refine((value) => {
    try {
      const parsed = new URL(value);
      return (parsed.protocol === "postgres:" || parsed.protocol === "postgresql:") &&
        parsed.hostname.length > 0;
    } catch {
      return false;
    }
  }, "DATABASE_URL must be a valid PostgreSQL connection URL").optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()))
    .pipe(
      z.array(
        z.string().url().refine((origin) => {
          const parsed = new URL(origin);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        }, "CORS origins must use HTTP or HTTPS"),
      ).min(1),
    ),
  BODY_LIMIT: z
    .string()
    .regex(/^\d+(kb|mb)$/i)
    .default("1mb"),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).max(100000).default(120),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000).default(60000),
  RATE_LIMIT_MAX_KEYS: z.coerce.number().int().min(100).max(1000000).default(10000),
  JWT_ISSUER: z.string().trim().min(1).optional(),
  JWT_AUDIENCE: z.string().trim().min(1).optional(),
  JWT_JWKS_URL: z.string().trim().min(1).optional(),
  JWT_ALGORITHMS: z
    .string()
    .default("RS256")
    .transform((value) => value.split(",").map((algorithm) => algorithm.trim()))
    .pipe(
      z.array(z.enum(["RS256", "PS256", "ES256"])).min(1)
        .refine((algorithms) => new Set(algorithms).size === algorithms.length,
          "JWT_ALGORITHMS must not contain duplicates"),
    ),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
}).superRefine((value, context) => {
  const configuredCount = [
    value.JWT_ISSUER,
    value.JWT_AUDIENCE,
    value.JWT_JWKS_URL,
  ].filter((item) => item !== undefined).length;

  if (value.JWT_ISSUER && value.JWT_AUDIENCE && value.JWT_JWKS_URL) {
    let issuerUrl: URL | undefined;
    let jwksUrl: URL | undefined;

    try {
      issuerUrl = new URL(value.JWT_ISSUER);
    } catch {
      context.addIssue({
        code: "custom",
        path: ["JWT_ISSUER"],
        message: "JWT_ISSUER must be a valid HTTPS URL with a hostname and no query or fragment.",
      });
    }

    try {
      jwksUrl = new URL(value.JWT_JWKS_URL);
    } catch {
      context.addIssue({
        code: "custom",
        path: ["JWT_JWKS_URL"],
        message: "JWT_JWKS_URL must be a valid HTTPS URL.",
      });
    }

    if (issuerUrl) {
      if (
        issuerUrl.protocol !== "https:" ||
        !issuerUrl.hostname ||
        issuerUrl.username ||
        issuerUrl.password ||
        issuerUrl.search ||
        issuerUrl.hash
      ) {
        context.addIssue({
          code: "custom",
          path: ["JWT_ISSUER"],
          message: "JWT_ISSUER must be a valid HTTPS URL with a hostname and no credentials, query, or fragment.",
        });
      }
    }

    if (jwksUrl) {
      if (
        jwksUrl.protocol !== "https:" ||
        !jwksUrl.hostname ||
        jwksUrl.username ||
        jwksUrl.password ||
        jwksUrl.search ||
        jwksUrl.hash ||
        jwksUrl.pathname.replace(/\/$/, "") !== "/.well-known/jwks.json"
      ) {
        context.addIssue({
          code: "custom",
          path: ["JWT_JWKS_URL"],
          message: "JWT_JWKS_URL must be an HTTPS URL ending in /.well-known/jwks.json, without credentials, query, or fragment.",
        });
      }
    }

    if (
      issuerUrl &&
      jwksUrl &&
      issuerUrl.hostname.toLowerCase() !== jwksUrl.hostname.toLowerCase()
    ) {
      context.addIssue({
        code: "custom",
        path: ["JWT_JWKS_URL"],
        message: "JWT_JWKS_URL must use the same hostname as JWT_ISSUER.",
      });
    }
  }
  if (configuredCount !== 0 && configuredCount !== 3) {
    context.addIssue({
      code: "custom",
      path: ["JWT_ISSUER"],
      message: "JWT_ISSUER, JWT_AUDIENCE, and JWT_JWKS_URL must be configured together.",
    });
  }

  if (value.NODE_ENV === "production" && !value.DATABASE_URL) {
    context.addIssue({
      code: "custom",
      path: ["DATABASE_URL"],
      message: "Production requires DATABASE_URL.",
    });
  }

  if (value.NODE_ENV === "production" && configuredCount !== 3) {
    context.addIssue({
      code: "custom",
      path: ["JWT_ISSUER"],
      message: "Production requires JWT issuer, audience, and JWKS configuration.",
    });
  }
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  const result = environmentSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid ModelNow API configuration:\n${details}`);
  }

  return result.data;
}

export const environment = loadEnvironment();
