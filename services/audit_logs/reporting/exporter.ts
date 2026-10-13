import type { AuditReport } from "./report_generator.js";

export type ReportFormat = "json" | "csv";

export class AuditReportExporter {
    export(
        report: AuditReport,
        format: ReportFormat = "json"
    ): string {
        if (format === "json") {
            return JSON.stringify(
                report,
                (_key, value) =>
                    value instanceof Date
                        ? value.toISOString()
                        : value,
                2
            );
        }

        return this.toCsv(report);
    }

    toCsv(report: AuditReport): string {
        const rows = [
            [
                "id",
                "type",
                "action",
                "actorId",
                "resourceType",
                "resourceId",
                "timestamp"
            ]
        ];

        for (const event of report.events) {
            rows.push([
                event.id,
                event.type,
                event.action,
                event.actorId ?? "",
                event.resourceType ?? "",
                event.resourceId ?? "",
                event.timestamp.toISOString()
            ]);
        }

        return rows
            .map((row) =>
                row
                    .map((value) => csvEscape(value))
                    .join(",")
            )
            .join("\n");
    }
}

function csvEscape(value: string): string {
    if (
        value.includes(",") ||
        value.includes('"') ||
        value.includes("\n")
    ) {
        return `"${value.replaceAll('"', '""')}"`;
    }

    return value;
}
