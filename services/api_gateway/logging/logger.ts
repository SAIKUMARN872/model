import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  service?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface LoggerOptions {
  serviceName?: string;
  level?: LogLevel;
  filePath?: string;
  consoleOutput?: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

function normalizeError(error: unknown): LogEntry["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    };
  }

  return {
    name: "Error",
    message: JSON.stringify(error),
  };
}

export class Logger {
  private readonly serviceName: string;
  private readonly minimumLevel: LogLevel;
  private readonly filePath?: string;
  private readonly consoleOutput: boolean;

  constructor(options: LoggerOptions = {}) {
    this.serviceName = options.serviceName ?? "modelnow-api-gateway";
    this.minimumLevel = options.level ?? "info";
    this.filePath = options.filePath;
    this.consoleOutput = options.consoleOutput ?? true;

    if (this.filePath) {
      const directory = dirname(this.filePath);

      if (!existsSync(directory)) {
        mkdirSync(directory, {
          recursive: true,
        });
      }
    }
  }

  debug(
    message: string,
    context?: LogContext,
  ): void {
    this.write("debug", message, context);
  }

  info(
    message: string,
    context?: LogContext,
  ): void {
    this.write("info", message, context);
  }

  warn(
    message: string,
    context?: LogContext,
  ): void {
    this.write("warn", message, context);
  }

  error(
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    this.write("error", message, context, error);
  }

  fatal(
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    this.write("fatal", message, context, error);
  }

  child(
    additionalContext: LogContext,
  ): ChildLogger {
    return new ChildLogger(this, additionalContext);
  }

  isLevelEnabled(level: LogLevel): boolean {
    return (
      LEVEL_PRIORITY[level] >=
      LEVEL_PRIORITY[this.minimumLevel]
    );
  }

  getLevel(): LogLevel {
    return this.minimumLevel;
  }

  getServiceName(): string {
    return this.serviceName;
  }

  health(): {
    status: "healthy";
    service: string;
    level: LogLevel;
  } {
    return {
      status: "healthy",
      service: this.serviceName,
      level: this.minimumLevel,
    };
  }

  private write(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      ...(context
        ? {
            context,
          }
        : {}),
      ...(error !== undefined
        ? {
            error: normalizeError(error),
          }
        : {}),
    };

    const serialized = JSON.stringify(entry);

    if (this.consoleOutput) {
      if (level === "error" || level === "fatal") {
        console.error(serialized);
      } else if (level === "warn") {
        console.warn(serialized);
      } else {
        console.log(serialized);
      }
    }

    if (this.filePath) {
      appendFileSync(
        this.filePath,
        `${serialized}\n`,
        "utf8",
      );
    }
  }
}

export class ChildLogger {
  constructor(
    private readonly logger: Logger,
    private readonly context: LogContext,
  ) {}

  debug(
    message: string,
    context?: LogContext,
  ): void {
    this.logger.debug(
      message,
      this.merge(context),
    );
  }

  info(
    message: string,
    context?: LogContext,
  ): void {
    this.logger.info(
      message,
      this.merge(context),
    );
  }

  warn(
    message: string,
    context?: LogContext,
  ): void {
    this.logger.warn(
      message,
      this.merge(context),
    );
  }

  error(
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    this.logger.error(
      message,
      this.merge(context),
      error,
    );
  }

  fatal(
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    this.logger.fatal(
      message,
      this.merge(context),
      error,
    );
  }

  private merge(
    context?: LogContext,
  ): LogContext {
    return {
      ...this.context,
      ...(context ?? {}),
    };
  }
}

export const logger = new Logger();