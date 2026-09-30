export type AnomalySeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface MonitoringEvent {
  id: string;
  type: string;
  action: string;
  resource: string;
  actorId?: string;
  organizationId?: string;
  ipAddress?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Anomaly {
  id: string;
  eventId: string;
  severity: AnomalySeverity;
  reason: string;
  score: number;
  detectedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AnomalyDetectorOptions {
  failureThreshold?: number;
  burstThreshold?: number;
  windowMs?: number;
}

export class AnomalyDetector {
  private readonly anomalies: Anomaly[] = [];

  private readonly failureThreshold: number;
  private readonly burstThreshold: number;
  private readonly windowMs: number;

  constructor(
    options: AnomalyDetectorOptions = {},
  ) {
    this.failureThreshold =
      options.failureThreshold ?? 5;

    this.burstThreshold =
      options.burstThreshold ?? 10;

    this.windowMs =
      options.windowMs ?? 60_000;
  }

  analyze(
    event: MonitoringEvent,
    recentEvents: MonitoringEvent[] = [],
  ): Anomaly[] {
    const detected: Anomaly[] = [];

    const now =
      new Date(event.timestamp).getTime();

    const windowStart =
      now - this.windowMs;

    const eventsInWindow =
      recentEvents.filter((item) => {
        const timestamp =
          new Date(item.timestamp).getTime();

        return (
          timestamp >= windowStart &&
          timestamp <= now
        );
      });

    const actorEvents =
      eventsInWindow.filter(
        (item) =>
          item.actorId === event.actorId,
      );

    const failedEvents =
      actorEvents.filter(
        (item) =>
          item.type === "failed" ||
          item.action.toLowerCase().includes(
            "fail",
          ),
      );

    if (
      failedEvents.length >=
      this.failureThreshold
    ) {
      detected.push(
        this.createAnomaly(
          event,
          "high",
          "High number of failed events detected",
          Math.min(
            1,
            failedEvents.length /
              this.failureThreshold,
          ),
        ),
      );
    }

    if (
      actorEvents.length >=
      this.burstThreshold
    ) {
      detected.push(
        this.createAnomaly(
          event,
          "medium",
          "High event activity detected",
          Math.min(
            1,
            actorEvents.length /
              this.burstThreshold,
          ),
        ),
      );
    }

    for (const anomaly of detected) {
      this.anomalies.push(anomaly);
    }

    return detected;
  }

  detect(
    event: MonitoringEvent,
    recentEvents: MonitoringEvent[] = [],
  ): Anomaly[] {
    return this.analyze(
      event,
      recentEvents,
    );
  }

  getById(
    id: string,
  ): Anomaly | undefined {
    return this.anomalies.find(
      (anomaly) => anomaly.id === id,
    );
  }

  all(): Anomaly[] {
    return [...this.anomalies];
  }

  count(): number {
    return this.anomalies.length;
  }

  clear(): void {
    this.anomalies.length = 0;
  }

  health(): {
    healthy: boolean;
    anomalyCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      anomalyCount: this.anomalies.length,
      timestamp: new Date().toISOString(),
    };
  }

  private createAnomaly(
    event: MonitoringEvent,
    severity: AnomalySeverity,
    reason: string,
    score: number,
  ): Anomaly {
    return {
      id: this.generateId(),
      eventId: event.id,
      severity,
      reason,
      score,
      detectedAt:
        new Date().toISOString(),
      metadata: event.metadata
        ? { ...event.metadata }
        : undefined,
    };
  }

  private generateId(): string {
    return `anomaly-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

export const anomalyDetector =
  new AnomalyDetector();