import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  AnomalyDetector,
  AuditMonitor,
} from "./index.js";

import type {
  MonitoringEvent,
} from "./anomaly_detector.js";

function createEvent(
  overrides: Partial<MonitoringEvent> = {},
): MonitoringEvent {
  return {
    id: `event-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    type: "created",
    action: "create",
    resource: "user",
    actorId: "actor-1",
    organizationId: "org-1",
    timestamp:
      new Date().toISOString(),
    ...overrides,
  };
}

test("anomaly detector starts healthy", () => {
  const detector =
    new AnomalyDetector();

  const health =
    detector.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.anomalyCount,
    0,
  );

  assert.ok(health.timestamp);
});

test("anomaly detector detects failed events", () => {
  const detector =
    new AnomalyDetector({
      failureThreshold: 3,
    });

  const baseTime =
    Date.now();

  const recentEvents: MonitoringEvent[] =
    [
      createEvent({
        id: "failed-1",
        type: "failed",
        action: "login_failed",
        timestamp:
          new Date(
            baseTime - 2_000,
          ).toISOString(),
      }),
      createEvent({
        id: "failed-2",
        type: "failed",
        action: "login_failed",
        timestamp:
          new Date(
            baseTime - 1_000,
          ).toISOString(),
      }),
      createEvent({
        id: "failed-3",
        type: "failed",
        action: "login_failed",
        timestamp:
          new Date(
            baseTime - 500,
          ).toISOString(),
      }),
    ];

  const event =
    createEvent({
      id: "failed-current",
      type: "failed",
      action: "login_failed",
      timestamp:
        new Date(baseTime).toISOString(),
    });

  const anomalies =
    detector.analyze(
      event,
      recentEvents,
    );

  assert.ok(
    anomalies.length > 0,
  );

  assert.equal(
    anomalies[0]?.severity,
    "high",
  );

  assert.ok(
    anomalies[0]?.reason.includes(
      "failed",
    ),
  );
});

test("anomaly detector detects burst activity", () => {
  const detector =
    new AnomalyDetector({
      burstThreshold: 3,
      failureThreshold: 100,
    });

  const baseTime =
    Date.now();

  const recentEvents: MonitoringEvent[] =
    [
      createEvent({
        id: "burst-1",
        timestamp:
          new Date(
            baseTime - 3_000,
          ).toISOString(),
      }),
      createEvent({
        id: "burst-2",
        timestamp:
          new Date(
            baseTime - 2_000,
          ).toISOString(),
      }),
      createEvent({
        id: "burst-3",
        timestamp:
          new Date(
            baseTime - 1_000,
          ).toISOString(),
      }),
    ];

  const event =
    createEvent({
      id: "burst-current",
      timestamp:
        new Date(baseTime).toISOString(),
    });

  const anomalies =
    detector.analyze(
      event,
      recentEvents,
    );

  assert.ok(
    anomalies.length > 0,
  );

  assert.equal(
    anomalies[0]?.severity,
    "medium",
  );
});

test("audit monitor records events", () => {
  const monitor =
    new AuditMonitor({
      detector:
        new AnomalyDetector({
          failureThreshold: 100,
          burstThreshold: 100,
        }),
    });

  const event =
    createEvent({
      id: "event-1",
    });

  const anomalies =
    monitor.record(event);

  assert.equal(
    anomalies.length,
    0,
  );

  assert.equal(
    monitor.eventCount(),
    1,
  );

  assert.equal(
    monitor.getEventById(
      "event-1",
    )?.id,
    "event-1",
  );
});

test("audit monitor records multiple events", () => {
  const monitor =
    new AuditMonitor({
      detector:
        new AnomalyDetector({
          failureThreshold: 100,
          burstThreshold: 100,
        }),
    });

  const events = [
    createEvent({
      id: "event-1",
    }),
    createEvent({
      id: "event-2",
    }),
    createEvent({
      id: "event-3",
    }),
  ];

  const anomalies =
    monitor.recordMany(events);

  assert.equal(
    anomalies.length,
    0,
  );

  assert.equal(
    monitor.eventCount(),
    3,
  );
});

test("audit monitor detects anomalies", () => {
  const monitor =
    new AuditMonitor({
      detector:
        new AnomalyDetector({
          failureThreshold: 2,
          burstThreshold: 100,
        }),
    });

  const baseTime =
    Date.now();

  monitor.record(
    createEvent({
      id: "failed-1",
      type: "failed",
      action: "login_failed",
      timestamp:
        new Date(
          baseTime - 1_000,
        ).toISOString(),
    }),
  );

  monitor.record(
    createEvent({
      id: "failed-2",
      type: "failed",
      action: "login_failed",
      timestamp:
        new Date(
          baseTime,
        ).toISOString(),
    }),
  );

  assert.ok(
    monitor.anomalyCount() > 0,
  );

  assert.ok(
    monitor.getAnomalies().length > 0,
  );
});

test("audit monitor clear works", () => {
  const monitor =
    new AuditMonitor();

  monitor.record(
    createEvent(),
  );

  assert.equal(
    monitor.eventCount(),
    1,
  );

  monitor.clear();

  assert.equal(
    monitor.eventCount(),
    0,
  );

  assert.equal(
    monitor.anomalyCount(),
    0,
  );
});

test("audit monitor health works", () => {
  const monitor =
    new AuditMonitor();

  const health =
    monitor.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.eventCount,
    0,
  );

  assert.equal(
    health.anomalyCount,
    0,
  );

  assert.ok(
    health.timestamp,
  );
});