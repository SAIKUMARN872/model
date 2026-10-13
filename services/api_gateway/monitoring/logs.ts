export interface GatewayLog {
  level: string;
  message: string;
  timestamp: string;
}

export class MonitoringLogs {
  private readonly logs: GatewayLog[] = [];

  add(
    level: string,
    message: string,
  ): GatewayLog {
    if (!level.trim() || !message.trim()) {
      throw new Error("Log level and message are required");
    }

    const log: GatewayLog = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(log);

    return { ...log };
  }

  list(): GatewayLog[] {
    return this.logs.map((log) => ({
      ...log,
    }));
  }
}
