// services/analytics/reports/report.ts

export type ReportType =
  | "performance"
  | "usage"
  | "cost"
  | "quality"
  | "latency"
  | "model"
  | "organization"
  | "custom";

export type ReportStatus =
  | "pending"
  | "completed"
  | "failed";

export interface ReportSection {
  title: string;
  data: Record<string, unknown>;
}

export interface Report {
  id: string;
  organizationId: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  description?: string;
  sections: ReportSection[];
  generatedAt: number;
  periodStart?: number;
  periodEnd?: number;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateReportInput {
  organizationId: string;
  name: string;
  type: ReportType;
  status?: ReportStatus;
  description?: string;
  sections?: ReportSection[];
  generatedAt?: number;
  periodStart?: number;
  periodEnd?: number;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ReportFilter {
  organizationId?: string;
  type?: ReportType;
  status?: ReportStatus;
  createdBy?: string;
  startTime?: number;
  endTime?: number;
}

export interface ReportStoreOptions {
  maxReports?: number;
  retentionMs?: number;
}

export interface ReportHealth {
  healthy: boolean;
  connected: boolean;
  reports: number;
  organizations: number;
  maxReports: number;
  retentionMs: number;
}

export interface ReportStatistics {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  byType: Record<string, number>;
}

const DEFAULT_MAX_REPORTS = 10_000;

const DEFAULT_RETENTION_MS =
  30 * 24 * 60 * 60 * 1000;

const VALID_REPORT_TYPES: ReportType[] = [
  "performance",
  "usage",
  "cost",
  "quality",
  "latency",
  "model",
  "organization",
  "custom",
];

const VALID_STATUSES: ReportStatus[] = [
  "pending",
  "completed",
  "failed",
];

function createId(): string {
  return `report_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function validateOrganizationId(
  organizationId: string,
): void {
  if (
    typeof organizationId !== "string" ||
    organizationId.trim().length === 0
  ) {
    throw new Error(
      "Organization ID is required",
    );
  }
}

export function validateReportName(
  name: string,
): void {
  if (
    typeof name !== "string" ||
    name.trim().length === 0
  ) {
    throw new Error(
      "Report name is required",
    );
  }
}

export function validateReportType(
  type: ReportType,
): void {
  if (!VALID_REPORT_TYPES.includes(type)) {
    throw new Error(
      `Invalid report type: ${type}`,
    );
  }
}

export function validateReportStatus(
  status: ReportStatus,
): void {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid report status: ${status}`,
    );
  }
}

function cloneReport(report: Report): Report {
  return cloneValue(report);
}

export class ReportStore {
  private readonly reports =
    new Map<string, Report>();

  private connected = false;

  private readonly maxReports: number;

  private readonly retentionMs: number;

  constructor(
    options: ReportStoreOptions = {},
  ) {
    this.maxReports =
      options.maxReports ??
      DEFAULT_MAX_REPORTS;

    this.retentionMs =
      options.retentionMs ??
      DEFAULT_RETENTION_MS;

    if (
      !Number.isInteger(this.maxReports) ||
      this.maxReports <= 0
    ) {
      throw new Error(
        "maxReports must be a positive integer",
      );
    }

    if (
      !Number.isFinite(this.retentionMs) ||
      this.retentionMs <= 0
    ) {
      throw new Error(
        "retentionMs must be a positive number",
      );
    }
  }

  connect(): void {
    this.connected = true;
    this.removeExpired();
    this.enforceRetention();
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  create(
    input: CreateReportInput,
  ): Report {
    this.ensureConnected();

    validateOrganizationId(
      input.organizationId,
    );

    validateReportName(input.name);

    validateReportType(input.type);

    const status =
      input.status ?? "completed";

    validateReportStatus(status);

    const generatedAt =
      input.generatedAt ?? Date.now();

    if (
      !Number.isFinite(generatedAt) ||
      generatedAt <= 0
    ) {
      throw new Error(
        "generatedAt must be a positive number",
      );
    }

    if (
      input.periodStart !== undefined &&
      !Number.isFinite(input.periodStart)
    ) {
      throw new Error(
        "periodStart must be a finite number",
      );
    }

    if (
      input.periodEnd !== undefined &&
      !Number.isFinite(input.periodEnd)
    ) {
      throw new Error(
        "periodEnd must be a finite number",
      );
    }

    if (
      input.periodStart !== undefined &&
      input.periodEnd !== undefined &&
      input.periodStart > input.periodEnd
    ) {
      throw new Error(
        "periodStart cannot be greater than periodEnd",
      );
    }

    const report: Report = {
      id: createId(),
      organizationId:
        input.organizationId,
      name: input.name,
      type: input.type,
      status,
      description: input.description,
      sections: cloneValue(
        input.sections ?? [],
      ),
      generatedAt,
      periodStart:
        input.periodStart,
      periodEnd:
        input.periodEnd,
      createdBy:
        input.createdBy,
      metadata: input.metadata
        ? cloneValue(input.metadata)
        : undefined,
    };

    this.reports.set(
      report.id,
      report,
    );

    this.removeExpired();
    this.enforceRetention();

    return cloneReport(report);
  }

  getById(
    id: string,
  ): Report | undefined {
    this.ensureConnected();

    const report =
      this.reports.get(id);

    if (!report) {
      return undefined;
    }

    if (this.isExpired(report)) {
      this.reports.delete(id);
      return undefined;
    }

    return cloneReport(report);
  }

  find(
    filter: ReportFilter = {},
  ): Report[] {
    this.ensureConnected();

    this.removeExpired();

    return [...this.reports.values()]
      .filter((report) => {
        if (
          filter.organizationId !==
            undefined &&
          report.organizationId !==
            filter.organizationId
        ) {
          return false;
        }

        if (
          filter.type !== undefined &&
          report.type !== filter.type
        ) {
          return false;
        }

        if (
          filter.status !== undefined &&
          report.status !== filter.status
        ) {
          return false;
        }

        if (
          filter.createdBy !==
            undefined &&
          report.createdBy !==
            filter.createdBy
        ) {
          return false;
        }

        if (
          filter.startTime !==
            undefined &&
          report.generatedAt <
            filter.startTime
        ) {
          return false;
        }

        if (
          filter.endTime !==
            undefined &&
          report.generatedAt >
            filter.endTime
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.generatedAt - a.generatedAt,
      )
      .map(cloneReport);
  }

  getAll(): Report[] {
    return this.find();
  }

  getOrganizationReports(
    organizationId: string,
  ): Report[] {
    validateOrganizationId(
      organizationId,
    );

    return this.find({
      organizationId,
    });
  }

  updateStatus(
    id: string,
    status: ReportStatus,
  ): Report {
    this.ensureConnected();

    validateReportStatus(status);

    const report =
      this.reports.get(id);

    if (!report) {
      throw new Error(
        `Report not found: ${id}`,
      );
    }

    report.status = status;

    return cloneReport(report);
  }

  addSection(
    id: string,
    section: ReportSection,
  ): Report {
    this.ensureConnected();

    if (
      !section ||
      typeof section.title !==
        "string" ||
      section.title.trim().length === 0
    ) {
      throw new Error(
        "Section title is required",
      );
    }

    if (
      !section.data ||
      typeof section.data !==
        "object"
    ) {
      throw new Error(
        "Section data is required",
      );
    }

    const report =
      this.reports.get(id);

    if (!report) {
      throw new Error(
        `Report not found: ${id}`,
      );
    }

    report.sections.push(
      cloneValue(section),
    );

    return cloneReport(report);
  }

  clearOrganization(
    organizationId: string,
  ): number {
    this.ensureConnected();

    validateOrganizationId(
      organizationId,
    );

    let deleted = 0;

    for (const [
      id,
      report,
    ] of this.reports.entries()) {
      if (
        report.organizationId ===
        organizationId
      ) {
        this.reports.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  clear(): number {
    this.ensureConnected();

    const count =
      this.reports.size;

    this.reports.clear();

    return count;
  }

  size(): number {
    return this.reports.size;
  }

  statistics(
    organizationId?: string,
  ): ReportStatistics {
    this.ensureConnected();

    const reports = organizationId
      ? this.find({
          organizationId,
        })
      : this.find();

    const byType: Record<
      string,
      number
    > = {};

    let pending = 0;
    let completed = 0;
    let failed = 0;

    for (const report of reports) {
      byType[report.type] =
        (byType[report.type] ?? 0) + 1;

      if (report.status === "pending") {
        pending++;
      }

      if (
        report.status === "completed"
      ) {
        completed++;
      }

      if (report.status === "failed") {
        failed++;
      }
    }

    return {
      total: reports.length,
      pending,
      completed,
      failed,
      byType,
    };
  }

  health(): ReportHealth {
    this.removeExpired();

    return {
      healthy: this.connected,
      connected: this.connected,
      reports: this.reports.size,
      organizations: new Set(
        [...this.reports.values()].map(
          (report) =>
            report.organizationId,
        ),
      ).size,
      maxReports: this.maxReports,
      retentionMs: this.retentionMs,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error(
        "Report store is not connected",
      );
    }
  }

  private isExpired(
    report: Report,
  ): boolean {
    return (
      report.generatedAt <
      Date.now() - this.retentionMs
    );
  }

  private removeExpired(): void {
    const cutoff =
      Date.now() - this.retentionMs;

    for (const [
      id,
      report,
    ] of this.reports.entries()) {
      if (
        report.generatedAt <
        cutoff
      ) {
        this.reports.delete(id);
      }
    }
  }

  private enforceRetention(): void {
    while (
      this.reports.size >
      this.maxReports
    ) {
      const oldest =
        [...this.reports.values()].sort(
          (a, b) =>
            a.generatedAt -
            b.generatedAt,
        )[0];

      if (!oldest) {
        break;
      }

      this.reports.delete(
        oldest.id,
      );
    }
  }
}

export default ReportStore;