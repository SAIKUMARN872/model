import {
  AnomalyDetector,
  anomalyDetector,
  type Anomaly,
  type MonitoringEvent,
} from "./anomaly_detector.js";

export interface AuditMonitorOptions {
  detector?: AnomalyDetector;
  maxEvents?: number;
}

export interface AuditMonitorHealth {
  healthy: boolean;
  eventCount: number;
  anomalyCount: number;
  timestamp: string;
}

export class AuditMonitor {
  private readonly events: MonitoringEvent[] = [];

  private readonly detector: AnomalyDetector;

  private readonly maxEvents: number;

  constructor(
    options: AuditMonitorOptions = {},
  ) {
    this.detector =
      options.detector ??
      anomalyDetector;

    this.maxEvents =
      options.maxEvents ?? 10_000;
  }

  record(
    event: MonitoringEvent,
  ): Anomaly[] {
    const recentEvents =
      this.events.slice();

    const anomalies =
      this.detector.analyze(
        event,
        recentEvents,
      );

    this.events.push({
      ...event,
      metadata: event.metadata
        ? { ...event.metadata }
        : undefined,
    });

    if (
      this.events.length >
      this.maxEvents
    ) {
      this.events.splice(
        0,
        this.events.length -
          this.maxEvents,
      );
    }

    return anomalies;
  }

  recordMany(
    events: MonitoringEvent[],
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const event of events) {
      anomalies.push(
        ...this.record(event),
      );
    }

    return anomalies;
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  getEventById(
    id: string,
  ): MonitoringEvent | undefined {
    return this.events.find(
      (event) => event.id === id,
    );
  }

  getAnomalies(): Anomaly[] {
    return this.detector.all();
  }

  getAnomalyById(
    id: string,
  ): Anomaly | undefined {
    return this.detector.getById(id);
  }

  eventCount(): number {
    return this.events.length;
  }

  anomalyCount(): number {
    return this.detector.count();
  }

  clear(): void {
    this.events.length = 0;
    this.detector.clear();
  }

  health(): AuditMonitorHealth {
    return {
      healthy:
        this.detector.health().healthy,
      eventCount: this.events.length,
      anomalyCount:
        this.detector.count(),
      timestamp:
        new Date().toISOString(),
    };
  }
}

export const auditMonitor =
  new AuditMonitor();