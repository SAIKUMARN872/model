import { randomUUID } from "node:crypto";
import { AnalyticsReport } from "./report.js";

export class ReportExporter {
  create(
    title: string,
    data: Record<string, unknown>,
  ): AnalyticsReport {
    if (!title.trim()) {
      throw new Error("Report title is required");
    }

    return {
      id: randomUUID(),
      title,
      generatedAt: new Date().toISOString(),
      data: structuredClone(data),
    };
  }

  toJson(report: AnalyticsReport): string {
    return JSON.stringify(report, null, 2);
  }
}
