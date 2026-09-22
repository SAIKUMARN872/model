// services/analytics/reports/exporter.ts

import {
  Report,
  ReportStore,
} from "./report.js";

export type ReportExportFormat =
  | "json"
  | "csv";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let text: string;

  if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function reportToCsv(
  report: Report,
): string {
  const rows: string[] = [];

  rows.push(
    [
      "id",
      "organizationId",
      "name",
      "type",
      "status",
      "description",
      "generatedAt",
      "periodStart",
      "periodEnd",
      "createdBy",
      "sections",
      "metadata",
    ].join(","),
  );

  rows.push(
    [
      report.id,
      report.organizationId,
      report.name,
      report.type,
      report.status,
      report.description ?? "",
      report.generatedAt,
      report.periodStart ?? "",
      report.periodEnd ?? "",
      report.createdBy ?? "",
      JSON.stringify(report.sections),
      JSON.stringify(report.metadata ?? {}),
    ]
      .map(escapeCsv)
      .join(","),
  );

  return rows.join("\n");
}

export function exportReportToJson(
  report: Report,
  pretty = true,
): string {
  return JSON.stringify(
    report,
    null,
    pretty ? 2 : 0,
  );
}

export function exportReportToCsv(
  report: Report,
): string {
  return reportToCsv(report);
}

export function exportReport(
  report: Report,
  format: ReportExportFormat,
  pretty = true,
): string {
  if (format === "json") {
    return exportReportToJson(
      report,
      pretty,
    );
  }

  if (format === "csv") {
    return exportReportToCsv(
      report,
    );
  }

  throw new Error(
    `Unsupported report export format: ${format}`,
  );
}

export function exportReportsToJson(
  reports: Report[],
  pretty = true,
): string {
  return JSON.stringify(
    reports,
    null,
    pretty ? 2 : 0,
  );
}

export function exportReportsToCsv(
  reports: Report[],
): string {
  if (reports.length === 0) {
    return [
      "id",
      "organizationId",
      "name",
      "type",
      "status",
      "description",
      "generatedAt",
      "periodStart",
      "periodEnd",
      "createdBy",
      "sections",
      "metadata",
    ].join(",");
  }

  const rows: string[] = [];

  rows.push(
    [
      "id",
      "organizationId",
      "name",
      "type",
      "status",
      "description",
      "generatedAt",
      "periodStart",
      "periodEnd",
      "createdBy",
      "sections",
      "metadata",
    ].join(","),
  );

  for (const report of reports) {
    rows.push(
      [
        report.id,
        report.organizationId,
        report.name,
        report.type,
        report.status,
        report.description ?? "",
        report.generatedAt,
        report.periodStart ?? "",
        report.periodEnd ?? "",
        report.createdBy ?? "",
        JSON.stringify(report.sections),
        JSON.stringify(
          report.metadata ?? {},
        ),
      ]
        .map(escapeCsv)
        .join(","),
    );
  }

  return rows.join("\n");
}

export function exportReports(
  reports: Report[],
  format: ReportExportFormat,
  pretty = true,
): string {
  if (format === "json") {
    return exportReportsToJson(
      reports,
      pretty,
    );
  }

  if (format === "csv") {
    return exportReportsToCsv(
      reports,
    );
  }

  throw new Error(
    `Unsupported report export format: ${format}`,
  );
}

export function exportFromStore(
  store: ReportStore,
  format: ReportExportFormat,
  organizationId?: string,
  pretty = true,
): string {
  const reports =
    organizationId !== undefined
      ? store.getOrganizationReports(
          organizationId,
        )
      : store.getAll();

  return exportReports(
    reports,
    format,
    pretty,
  );
}