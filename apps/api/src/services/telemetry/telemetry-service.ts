import type { ExecutionTelemetry } from "./telemetry-types.js";

export class TelemetryService {
  private readonly records: ExecutionTelemetry[] = [];

  record(record: ExecutionTelemetry): void {
    this.records.push(record);
  }

  list(): ExecutionTelemetry[] {
    return [...this.records];
  }

  getModelStats(model: string) {
    const records = this.records.filter(
      (record) => record.model === model,
    );

    if (records.length === 0) {
      return null;
    }

    const successful = records.filter((record) => record.success);

    const averageLatencyMs =
      successful.length > 0
        ? successful.reduce(
            (sum, record) => sum + record.latencyMs,
            0,
          ) / successful.length
        : 0;

    const totalInputTokens = successful.reduce(
      (sum, record) => sum + (record.inputTokens ?? 0),
      0,
    );

    const totalOutputTokens = successful.reduce(
      (sum, record) => sum + (record.outputTokens ?? 0),
      0,
    );

    return {
      model,
      executions: records.length,
      successfulExecutions: successful.length,
      failedExecutions: records.length - successful.length,
      averageLatencyMs,
      totalInputTokens,
      totalOutputTokens,
    };
  }
}

export const telemetryService = new TelemetryService();
