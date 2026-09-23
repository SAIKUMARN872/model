import { randomUUID } from "node:crypto";

export type MonitoringLogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export interface MonitoringLogContext {
  [key: string]: unknown;
}

export interface MonitoringLogEntry {
  id: string;
  timestamp: string;
  level: MonitoringLogLevel;
  service: string;
  message: string;
  requestId?: string;
  context?: MonitoringLogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface MonitoringLogFilter {
  level?: MonitoringLogLevel;
  service?: string;
  requestId?: string;
  limit?: number;
}

export interface MonitoringLogsOptions {
  serviceName?: string;
  maxEntries?: number;
  consoleOutput?: boolean;
}

export interface MonitoringLogsHealth {
  healthy: boolean;
  service: string;
  entryCount: number;
  maxEntries: number;
  timestamp: string;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
  "api_key",
  "apikey",
  "client_secret",
]);

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  const result: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeValue(item);
    }
  }

  return result;
}

function normalizeError(
  error: unknown,
): MonitoringLogEntry["error"] | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

export class MonitoringLogs {
  private readonly entries: MonitoringLogEntry[] = [];

  private readonly serviceName: string;

  private readonly maxEntries: number;

  private readonly consoleOutput: boolean;

  constructor(options: MonitoringLogsOptions = {}) {
    this.serviceName = options.serviceName ?? "modelnow-api-gateway";

    this.maxEntries = Math.max(
      1,
      Math.floor(options.maxEntries ?? 5000),
    );

    this.consoleOutput = options.consoleOutput ?? false;
  }

  private write(
    level: MonitoringLogLevel,
    message: string,
    context?: MonitoringLogContext,
    error?: unknown,
  ): MonitoringLogEntry {
    const entry: MonitoringLogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context: context
        ? (sanitizeValue(context) as MonitoringLogContext)
        : undefined,
      error: normalizeError(error),
    };

    if (entry.context === undefined) {
      delete entry.context;
    }

    if (entry.error === undefined) {
      delete entry.error;
    }

    this.entries.push(entry);

    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    if (this.consoleOutput) {
      console.log(JSON.stringify(entry));
    }

    return { ...entry };
  }

  debug(
    message: string,
    context?: MonitoringLogContext,
  ): MonitoringLogEntry {
    return this.write("debug", message, context);
  }

  info(
    message: string,
    context?: MonitoringLogContext,
  ): MonitoringLogEntry {
    return this.write("info", message, context);
  }

  warn(
    message: string,
    context?: MonitoringLogContext,
  ): MonitoringLogEntry {
    return this.write("warn", message, context);
  }

  error(
    message: string,
    context?: MonitoringLogContext,
    error?: unknown,
  ): MonitoringLogEntry {
    return this.write("error", message, context, error);
  }

  fatal(
    message: string,
    context?: MonitoringLogContext,
    error?: unknown,
  ): MonitoringLogEntry {
    return this.write("fatal", message, context, error);
  }

  query(filter: MonitoringLogFilter = {}): MonitoringLogEntry[] {
    let result = this.entries.filter((entry) => {
      if (filter.level && entry.level !== filter.level) {
        return false;
      }

      if (filter.service && entry.service !== filter.service) {
        return false;
      }

      if (filter.requestId && entry.requestId !== filter.requestId) {
        return false;
      }

      return true;
    });

    if (filter.limit !== undefined) {
      const limit = Math.max(0, Math.floor(filter.limit));

      result = result.slice(-limit);
    }

    return result.map((entry) => ({
      ...entry,
      context: entry.context
        ? { ...entry.context }
        : undefined,
      error: entry.error
        ? { ...entry.error }
        : undefined,
    }));
  }

  getAll(): MonitoringLogEntry[] {
    return this.query();
  }

  size(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries.length = 0;
  }

  exportJson(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  health(): MonitoringLogsHealth {
    return {
      healthy: true,
      service: this.serviceName,
      entryCount: this.entries.length,
      maxEntries: this.maxEntries,
      timestamp: new Date().toISOString(),
    };
  }
}

export const monitoringLogs = new MonitoringLogs();