import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  ReportExporter,
  ReportGenerator,
} from "./index.js";

import type {
  ReportEvent,
} from "./report_generator.js";

function createEvent(
  overrides: Partial<ReportEvent> = {},
): ReportEvent {
  return {
    id: `event-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    type: "created",
    severity: "info",
    action: "create",
    resource: "user",
    resourceId: "user-1",
    actorId: "actor-1",
    organizationId: "org-1",
    timestamp:
      new Date().toISOString(),
    ...overrides,
  };
}

test("report generator creates a report", () => {
  const generator =
    new ReportGenerator();

  const events = [
    createEvent({
      id: "event-1",
    }),
    createEvent({
      id: "event-2",
      type: "updated",
      action: "update",
      resource: "project",
    }),
  ];

  const report =
    generator.generate(events);

  assert.ok(report.id);

  assert.equal(
    report.status,
    "generated",
  );

  assert.equal(
    report.format,
    "json",
  );

  assert.equal(
    report.events.length,
    2,
  );

  assert.equal(
    report.summary.totalEvents,
    2,
  );
});

test("report generator calculates summary", () => {
  const generator =
    new ReportGenerator();

  const events = [
    createEvent({
      id: "event-1",
      severity: "info",
      actorId: "actor-1",
      resource: "user",
    }),
    createEvent({
      id: "event-2",
      type: "failed",
      severity: "error",
      actorId: "actor-2",
      resource: "api",
    }),
    createEvent({
      id: "event-3",
      severity: "warning",
      actorId: "actor-1",
      resource: "user",
    }),
    createEvent({
      id: "event-4",
      severity: "critical",
      actorId: "actor-3",
      resource: "database",
    }),
  ];

  const report =
    generator.generate(events);

  assert.equal(
    report.summary.totalEvents,
    4,
  );

  assert.equal(
    report.summary.successfulEvents,
    3,
  );

  assert.equal(
    report.summary.failedEvents,
    1,
  );

  assert.equal(
    report.summary.warningEvents,
    1,
  );

  assert.equal(
    report.summary.criticalEvents,
    1,
  );

  assert.equal(
    report.summary.uniqueActors,
    3,
  );

  assert.equal(
    report.summary.uniqueResources,
    3,
  );
});

test("report generator filters events", () => {
  const generator =
    new ReportGenerator();

  const events = [
    createEvent({
      id: "event-1",
      resource: "user",
    }),
    createEvent({
      id: "event-2",
      resource: "project",
    }),
  ];

  const report =
    generator.generate(
      events,
      {
        filter: {
          resource: "user",
        },
      },
    );

  assert.equal(
    report.events.length,
    1,
  );

  assert.equal(
    report.events[0]?.id,
    "event-1",
  );
});

test("report generator stores reports", () => {
  const generator =
    new ReportGenerator();

  const report =
    generator.generate([
      createEvent(),
    ]);

  assert.equal(
    generator.count(),
    1,
  );

  assert.equal(
    generator.getById(report.id)?.id,
    report.id,
  );

  assert.equal(
    generator.all().length,
    1,
  );
});

test("json export works", () => {
  const generator =
    new ReportGenerator();

  const exporter =
    new ReportExporter();

  const report =
    generator.generate([
      createEvent(),
    ]);

  const result =
    exporter.exportJson(report);

  assert.equal(
    result.format,
    "json",
  );

  assert.equal(
    result.contentType,
    "application/json",
  );

  assert.ok(
    result.content.includes(
      report.id,
    ),
  );

  assert.ok(result.size > 0);
});

test("csv export works", () => {
  const generator =
    new ReportGenerator();

  const exporter =
    new ReportExporter();

  const report =
    generator.generate([
      createEvent(),
    ]);

  const result =
    exporter.exportCsv(report);

  assert.equal(
    result.format,
    "csv",
  );

  assert.equal(
    result.contentType,
    "text/csv",
  );

  assert.ok(
    result.content.includes(
      "id,type,severity",
    ),
  );

  assert.ok(
    result.content.includes(
      "event",
    ),
  );

  assert.ok(result.size > 0);
});

test("text export works", () => {
  const generator =
    new ReportGenerator();

  const exporter =
    new ReportExporter();

  const report =
    generator.generate([
      createEvent(),
    ]);

  const result =
    exporter.exportText(report);

  assert.equal(
    result.format,
    "text",
  );

  assert.equal(
    result.contentType,
    "text/plain",
  );

  assert.ok(
    result.content.includes(
      "Report:",
    ),
  );

  assert.ok(
    result.content.includes(
      "Summary",
    ),
  );

  assert.ok(result.size > 0);
});

test("report generator clear works", () => {
  const generator =
    new ReportGenerator();

  generator.generate([
    createEvent(),
  ]);

  assert.equal(
    generator.count(),
    1,
  );

  generator.clear();

  assert.equal(
    generator.count(),
    0,
  );
});

test("report generator health works", () => {
  const generator =
    new ReportGenerator();

  const health =
    generator.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.reportCount,
    0,
  );

  assert.ok(health.timestamp);
});

test("report exporter health works", () => {
  const exporter =
    new ReportExporter();

  const health =
    exporter.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.ok(health.timestamp);
});