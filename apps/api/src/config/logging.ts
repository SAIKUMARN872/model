import { settings } from "./settings.js";

type LogFields = Record<string, unknown>;
type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const sensitiveKey =
  /authorization|cookie|password|secret|token|api[-_]?key|credential/i;

function sanitizeString(value: string): string {
  return value
    .replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, "[REDACTED]");
}

function sanitize(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (typeof value === "string") return sanitizeString(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= 8) return "[MAX_DEPTH]";

  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) =>
      sanitize(item, depth + 1, seen),
    );
  }

  const output: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    output[key] = sensitiveKey.test(key)
      ? "[REDACTED]"
      : sanitize(item, depth + 1, seen);
  }

  return output;
}

function write(
  level: LogLevel,
  message: string,
  fields: LogFields = {},
): void {
  if (levelPriority[level] < levelPriority[settings.logging.level]) return;

  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: settings.serviceName,
    environment: settings.environment,
    message: sanitizeString(message),
    ...((Object.keys(fields).length > 0)
      ? { fields: sanitize(fields) }
      : {}),
  };

  let serialized: string;

  try {
    serialized = JSON.stringify(record);
  } catch {
    serialized = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      service: settings.serviceName,
      message: "Log serialization failed",
    });
  }

  if (level === "warn" || level === "error") {
    process.stderr.write(`${serialized}\n`);
  } else {
    process.stdout.write(`${serialized}\n`);
  }
}

export const logger = Object.freeze({
  debug: (message: string, fields?: LogFields) =>
    write("debug", message, fields),
  info: (message: string, fields?: LogFields) =>
    write("info", message, fields),
  warn: (message: string, fields?: LogFields) =>
    write("warn", message, fields),
  error: (message: string, fields?: LogFields) =>
    write("error", message, fields),
});

export type { LogFields, LogLevel };
