// services/analytics/reports/test_reports.ts

import {
  ReportStore,
  exportReport,
  exportReportToCsv,
  exportReportToJson,
  exportReports,
  exportFromStore,
  validateReportName,
  validateReportStatus,
  validateReportType,
} from "./index.js";

const assert = {
  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  ok(value: unknown): void {
    if (!value) {
      throw new Error("Assertion failed");
    }
  },

  throws(fn: () => void, expected?: RegExp | string): void {
    try {
      fn();
      throw new Error("Expected function to throw");
    } catch (error) {
      if (expected) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          (typeof expected === "string" && !message.includes(expected)) ||
          (expected instanceof RegExp && !expected.test(message))
        ) {
          throw new Error(
            `Expected thrown error to match ${String(expected)}, got ${message}`,
          );
        }
      }
    }
  },
};

async function test(
  name: string,
  fn: () => Promise<void> | void,
): Promise<void> {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const store = new ReportStore({
  maxReports: 100,
  retentionMs: 60 * 60 * 1000,
});

await test("reports module", async () => {
  await test("starts disconnected", () => {
    assert.equal(store.isConnected(), false);
    assert.equal(store.size(), 0);
  });

  await test("rejects creation while disconnected", () => {
    assert.throws(
      () =>
        store.create({
          organizationId: "org-1",
          name: "Test Report",
          type: "performance",
        }),
      /not connected/,
    );
  });

  await test("connects successfully", () => {
    store.connect();
    assert.equal(store.isConnected(), true);
  });

  await test("creates performance report", () => {
    const report = store.create({
      organizationId: "org-1",
      name: "Performance Report",
      type: "performance",
      description: "Monthly performance report",
      status: "completed",
      sections: [{
        title: "Latency",
        data: { average: 250, p95: 500 },
      }],
      createdBy: "admin",
      metadata: { environment: "production" },
    });

    assert.ok(report.id);
    assert.equal(report.organizationId, "org-1");
    assert.equal(report.name, "Performance Report");
    assert.equal(report.type, "performance");
    assert.equal(report.status, "completed");
    assert.equal(report.sections.length, 1);
  });

  await test("creates reports of different types", () => {
    store.create({
      organizationId: "org-1",
      name: "Usage Report",
      type: "usage",
    });

    store.create({
      organizationId: "org-1",
      name: "Cost Report",
      type: "cost",
    });

    store.create({
      organizationId: "org-2",
      name: "Quality Report",
      type: "quality",
    });

    assert.ok(store.size() >= 4);
  });

  await test("isolates organizations", () => {
    const org1 = store.getOrganizationReports("org-1");
    const org2 = store.getOrganizationReports("org-2");

    assert.ok(org1.length > 0);
    assert.ok(org2.length > 0);
    assert.ok(org1.every((report) => report.organizationId === "org-1"));
    assert.ok(org2.every((report) => report.organizationId === "org-2"));
  });

  await test("filters by report type", () => {
    const reports = store.find({
      organizationId: "org-1",
      type: "cost",
    });

    assert.ok(reports.length > 0);
    assert.ok(reports.every((report) => report.type === "cost"));
  });

  await test("filters by status", () => {
    store.create({
      organizationId: "org-status",
      name: "Pending Report",
      type: "custom",
      status: "pending",
    });

    const reports = store.find({
      organizationId: "org-status",
      status: "pending",
    });

    assert.equal(reports.length, 1);
    assert.equal(reports[0].status, "pending");
  });

  await test("gets report by ID", () => {
    const report = store.create({
      organizationId: "org-get",
      name: "Get Report",
      type: "model",
    });

    const result = store.getById(report.id);
    assert.ok(result);

    const item = result!;
    assert.equal(item.id, report.id);
  });

  await test("returns undefined for unknown report", () => {
    assert.equal(store.getById("unknown-report"), undefined);
  });

  await test("updates report status", () => {
    const report = store.create({
      organizationId: "org-update",
      name: "Update Report",
      type: "usage",
      status: "pending",
    });

    const updated = store.updateStatus(report.id, "completed");
    assert.equal(updated.status, "completed");
  });

  await test("adds report section", () => {
    const report = store.create({
      organizationId: "org-section",
      name: "Section Report",
      type: "custom",
    });

    const updated = store.addSection(report.id, {
      title: "Summary",
      data: { totalRequests: 100, errors: 2 },
    });

    assert.equal(updated.sections.length, 1);
    assert.equal(updated.sections[0].title, "Summary");
  });

  await test("returns statistics", () => {
    const stats = store.statistics("org-1");

    assert.ok(stats.total > 0);
    assert.equal(stats.completed >= 0, true);
    assert.ok(Object.keys(stats.byType).length > 0);
  });

  await test("exports report as JSON", () => {
    const report = store.create({
      organizationId: "org-json",
      name: "JSON Report",
      type: "performance",
      sections: [{
        title: "Metrics",
        data: { latency: 100 },
      }],
    });

    const json = exportReportToJson(report);
    const parsed = JSON.parse(json) as typeof report;

    assert.equal(parsed.id, report.id);
    assert.equal(parsed.name, "JSON Report");
  });

  await test("exports report as CSV", () => {
    const report = store.create({
      organizationId: "org-csv",
      name: "CSV Report",
      type: "cost",
    });

    const csv = exportReportToCsv(report);

    assert.ok(csv.includes("id"));
    assert.ok(csv.includes("organizationId"));
    assert.ok(csv.includes("CSV Report"));
  });

  await test("exports using format selector", () => {
    const report = store.create({
      organizationId: "org-export",
      name: "Export Report",
      type: "quality",
    });

    const json = exportReport(report, "json");
    const csv = exportReport(report, "csv");

    assert.ok(json.includes("Export Report"));
    assert.ok(csv.includes("Export Report"));
  });

  await test("exports multiple reports", () => {
    const reports = store.getOrganizationReports("org-1");
    const json = exportReports(reports, "json");
    const csv = exportReports(reports, "csv");

    assert.ok(json.length > 0);
    assert.ok(csv.length > 0);
  });

  await test("exports reports from store", () => {
    const json = exportFromStore(store, "json", "org-1");
    const parsed = JSON.parse(json) as unknown[];

    assert.ok(parsed.length > 0);
  });

  await test("health check works", () => {
    const health = store.health();

    assert.equal(health.healthy, true);
    assert.equal(health.connected, true);
    assert.ok(health.reports >= 0);
    assert.ok(health.organizations >= 0);
  });

  await test("clears organization", () => {
    store.create({
      organizationId: "org-clear",
      name: "Clear Report 1",
      type: "usage",
    });

    store.create({
      organizationId: "org-clear",
      name: "Clear Report 2",
      type: "cost",
    });

    const deleted = store.clearOrganization("org-clear");

    assert.equal(deleted, 2);
    assert.equal(store.getOrganizationReports("org-clear").length, 0);
  });

  await test("enforces maximum reports", () => {
    const limited = new ReportStore({
      maxReports: 2,
      retentionMs: 60 * 60 * 1000,
    });

    limited.connect();

    limited.create({
      organizationId: "org-limit",
      name: "First",
      type: "custom",
      generatedAt: Date.now() - 3000,
    });

    limited.create({
      organizationId: "org-limit",
      name: "Second",
      type: "custom",
      generatedAt: Date.now() - 2000,
    });

    limited.create({
      organizationId: "org-limit",
      name: "Third",
      type: "custom",
      generatedAt: Date.now() - 1000,
    });

    assert.equal(limited.size(), 2);

    const reports = limited.getAll();
    assert.equal(reports[0].name, "Third");
    assert.equal(reports[1].name, "Second");
  });

  await test("rejects invalid report name", () => {
    assert.throws(() => validateReportName(""), /required/);
  });

  await test("rejects invalid report type", () => {
    assert.throws(() => validateReportType("invalid" as never), /Invalid report type/);
  });

  await test("rejects invalid report status", () => {
    assert.throws(() => validateReportStatus("invalid" as never), /Invalid report status/);
  });

  await test("clears all reports", () => {
    const count = store.size();
    const deleted = store.clear();

    assert.equal(deleted, count);
    assert.equal(store.size(), 0);
  });

  await test("disconnects successfully", () => {
    store.disconnect();
    assert.equal(store.isConnected(), false);
  });

  console.log("Reports module test suite completed successfully.");
});