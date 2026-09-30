export type ReportFormat =
  | "json"
  | "csv"
  | "text";

export type ReportStatus =
  | "generated"
  | "failed";

export interface ReportEvent {
  id: string;
  type: string;
  severity: string;
  action: string;
  resource: string;
  resourceId?: string;
  actorId?: string;
  organizationId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ReportFilter {
  type?: string;
  severity?: string;
  action?: string;
  resource?: string;
  actorId?: string;
  organizationId?: string;
  from?: string;
  to?: string;
}

export interface ReportSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  warningEvents: number;
  criticalEvents: number;
  uniqueActors: number;
  uniqueResources: number;
}

export interface AuditReport {
  id: string;
  title: string;
  status: ReportStatus;
  generatedAt: string;
  format: ReportFormat;
  summary: ReportSummary;
  events: ReportEvent[];
}

export class ReportGenerator {
  private readonly reports: AuditReport[] = [];

  generate(
    events: ReportEvent[],
    options: {
      title?: string;
      format?: ReportFormat;
      filter?: ReportFilter;
    } = {},
  ): AuditReport {
    const filteredEvents =
      this.filterEvents(
        events,
        options.filter,
      );

    const report: AuditReport = {
      id: this.generateId(),
      title:
        options.title ??
        "Audit Log Report",
      status: "generated",
      generatedAt:
        new Date().toISOString(),
      format:
        options.format ?? "json",
      summary:
        this.createSummary(
          filteredEvents,
        ),
      events: filteredEvents.map(
        (event) => ({
          ...event,
          metadata: event.metadata
            ? { ...event.metadata }
            : undefined,
        }),
      ),
    };

    this.reports.push(report);

    return report;
  }

  getById(
    id: string,
  ): AuditReport | undefined {
    return this.reports.find(
      (report) => report.id === id,
    );
  }

  all(): AuditReport[] {
    return [...this.reports];
  }

  count(): number {
    return this.reports.length;
  }

  clear(): void {
    this.reports.length = 0;
  }

  health(): {
    healthy: boolean;
    reportCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      reportCount: this.reports.length,
      timestamp:
        new Date().toISOString(),
    };
  }

  private filterEvents(
    events: ReportEvent[],
    filter?: ReportFilter,
  ): ReportEvent[] {
    if (!filter) {
      return [...events];
    }

    return events.filter((event) => {
      if (
        filter.type !== undefined &&
        event.type !== filter.type
      ) {
        return false;
      }

      if (
        filter.severity !== undefined &&
        event.severity !== filter.severity
      ) {
        return false;
      }

      if (
        filter.action !== undefined &&
        event.action !== filter.action
      ) {
        return false;
      }

      if (
        filter.resource !== undefined &&
        event.resource !== filter.resource
      ) {
        return false;
      }

      if (
        filter.actorId !== undefined &&
        event.actorId !== filter.actorId
      ) {
        return false;
      }

      if (
        filter.organizationId !==
          undefined &&
        event.organizationId !==
          filter.organizationId
      ) {
        return false;
      }

      if (
        filter.from !== undefined &&
        event.timestamp < filter.from
      ) {
        return false;
      }

      if (
        filter.to !== undefined &&
        event.timestamp > filter.to
      ) {
        return false;
      }

      return true;
    });
  }

  private createSummary(
    events: ReportEvent[],
  ): ReportSummary {
    const actors = new Set<string>();
    const resources = new Set<string>();

    let successfulEvents = 0;
    let failedEvents = 0;
    let warningEvents = 0;
    let criticalEvents = 0;

    for (const event of events) {
      if (event.actorId) {
        actors.add(event.actorId);
      }

      resources.add(event.resource);

      if (
        event.type === "failed" ||
        event.severity === "error"
      ) {
        failedEvents += 1;
      } else {
        successfulEvents += 1;
      }

      if (
        event.severity === "warning"
      ) {
        warningEvents += 1;
      }

      if (
        event.severity === "critical"
      ) {
        criticalEvents += 1;
      }
    }

    return {
      totalEvents: events.length,
      successfulEvents,
      failedEvents,
      warningEvents,
      criticalEvents,
      uniqueActors: actors.size,
      uniqueResources: resources.size,
    };
  }

  private generateId(): string {
    return `report-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

export const reportGenerator =
  new ReportGenerator();