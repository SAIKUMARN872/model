import type {
  AuditReport,
  ReportEvent,
  ReportFormat,
} from "./report_generator.js";

export interface ExportResult {
  reportId: string;
  format: ReportFormat;
  contentType: string;
  content: string;
  size: number;
  exportedAt: string;
}

export class ReportExporter {
  export(
    report: AuditReport,
    format: ReportFormat = report.format,
  ): ExportResult {
    let content: string;
    let contentType: string;

    switch (format) {
      case "json":
        content =
          JSON.stringify(
            report,
            null,
            2,
          );
        contentType =
          "application/json";
        break;

      case "csv":
        content =
          this.toCsv(report.events);
        contentType =
          "text/csv";
        break;

      case "text":
        content =
          this.toText(report);
        contentType =
          "text/plain";
        break;

      default:
        throw new Error(
          `Unsupported report format: ${format}`,
        );
    }

    return {
      reportId: report.id,
      format,
      contentType,
      content,
      size: Buffer.byteLength(
        content,
        "utf8",
      ),
      exportedAt:
        new Date().toISOString(),
    };
  }

  exportJson(
    report: AuditReport,
  ): ExportResult {
    return this.export(
      report,
      "json",
    );
  }

  exportCsv(
    report: AuditReport,
  ): ExportResult {
    return this.export(
      report,
      "csv",
    );
  }

  exportText(
    report: AuditReport,
  ): ExportResult {
    return this.export(
      report,
      "text",
    );
  }

  health(): {
    healthy: boolean;
    timestamp: string;
  } {
    return {
      healthy: true,
      timestamp:
        new Date().toISOString(),
    };
  }

  private toCsv(
    events: ReportEvent[],
  ): string {
    const headers = [
      "id",
      "type",
      "severity",
      "action",
      "resource",
      "resourceId",
      "actorId",
      "organizationId",
      "timestamp",
    ];

    const rows = events.map(
      (event) =>
        [
          event.id,
          event.type,
          event.severity,
          event.action,
          event.resource,
          event.resourceId ?? "",
          event.actorId ?? "",
          event.organizationId ?? "",
          event.timestamp,
        ]
          .map((value) =>
            this.escapeCsv(
              String(value),
            ),
          )
          .join(","),
    );

    return [
      headers.join(","),
      ...rows,
    ].join("\n");
  }

  private toText(
    report: AuditReport,
  ): string {
    const lines: string[] = [];

    lines.push(
      `Report: ${report.title}`,
    );

    lines.push(
      `Report ID: ${report.id}`,
    );

    lines.push(
      `Generated At: ${report.generatedAt}`,
    );

    lines.push(
      `Status: ${report.status}`,
    );

    lines.push("");

    lines.push("Summary");

    lines.push(
      `Total Events: ${report.summary.totalEvents}`,
    );

    lines.push(
      `Successful Events: ${report.summary.successfulEvents}`,
    );

    lines.push(
      `Failed Events: ${report.summary.failedEvents}`,
    );

    lines.push(
      `Warning Events: ${report.summary.warningEvents}`,
    );

    lines.push(
      `Critical Events: ${report.summary.criticalEvents}`,
    );

    lines.push(
      `Unique Actors: ${report.summary.uniqueActors}`,
    );

    lines.push(
      `Unique Resources: ${report.summary.uniqueResources}`,
    );

    lines.push("");

    lines.push("Events");

    for (const event of report.events) {
      lines.push(
        [
          event.timestamp,
          event.type,
          event.severity,
          event.action,
          event.resource,
          event.resourceId ?? "",
          event.actorId ?? "",
        ].join(" | "),
      );
    }

    return lines.join("\n");
  }

  private escapeCsv(
    value: string,
  ): string {
    if (
      value.includes(",") ||
      value.includes('"') ||
      value.includes("\n")
    ) {
      return `"${value.replace(
        /"/g,
        '""',
      )}"`;
    }

    return value;
  }
}

export const reportExporter =
  new ReportExporter();