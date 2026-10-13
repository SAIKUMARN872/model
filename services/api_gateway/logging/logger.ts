export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export class GatewayLogger {
  private readonly entries: LogEntry[] = [];

  log(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown> = {},
  ): LogEntry {
    if (!message.trim()) {
      throw new Error("Log message is required");
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: structuredClone(metadata),
    };

    this.entries.push(entry);

    return structuredClone(entry);
  }

  list(): LogEntry[] {
    return this.entries.map((entry) =>
      structuredClone(entry),
    );
  }

  clear(): void {
    this.entries.length = 0;
  }
}
