import assert from "node:assert/strict";
import test from "node:test";

import {
    EventProcessor,
    EventPublisher,
    AnomalyDetector,
    AuditMonitor,
    ReportGenerator,
    AuditReportExporter,
    AuditArchive,
    InMemoryAuditRepository,
    ActivityTracker,
    UserTracker
} from "../index.js";

function event(
    overrides: Partial<import("../events/event_processor.js").AuditEvent> = {}
) {
    return {
        id: "event-1",
        type: "user",
        action: "login",
        timestamp: new Date("2026-01-01T00:00:00.000Z"),
        metadata: {},
        ...overrides
    };
}

test("event processor", async () => {
    const processor = new EventProcessor();
    let count = 0;

    processor.register("user", () => {
        count++;
    });

    await processor.process(event());

    assert.equal(count, 1);
    assert.equal(processor.handlerCount("user"), 1);
});

test("event publisher", async () => {
    const publisher = new EventPublisher();
    let received = 0;

    publisher.subscribe("user", () => {
        received++;
    });

    const result = await publisher.publish({
        type: "user",
        action: "login",
        metadata: {}
    });

    assert.equal(received, 1);
    assert.equal(result.delivered, 1);
    assert.equal(result.failed, 0);
    assert.ok(result.event.id);
});

test("anomaly detector", () => {
    const detector = new AnomalyDetector({ threshold: 3 });

    assert.equal(detector.isAnomalous(2), false);
    assert.equal(detector.isAnomalous(3), true);

    const anomaly = detector.detect(event(), 4);

    assert.ok(anomaly);
    assert.equal(anomaly.score, 4);
});

test("audit monitor", () => {
    const monitor = new AuditMonitor(
        new Object({
            detector: new AnomalyDetector({ threshold: 2 })
        }) as { detector: AnomalyDetector }
    );

    const anomaly = monitor.inspect(event(), 3);

    assert.ok(anomaly);
    assert.equal(monitor.count(), 1);
    assert.equal(monitor.getAnomalies().length, 1);
});

test("report generation and CSV export", () => {
    const generator = new ReportGenerator({
        now: () => new Date("2026-02-01T00:00:00.000Z")
    });

    const report = generator.generate([
        event(),
        event({
            id: "event-2",
            action: "logout"
        })
    ]);

    assert.equal(report.totalEvents, 2);
    assert.equal(report.summary.login, 1);
    assert.equal(report.summary.logout, 1);

    const exporter = new AuditReportExporter();

    assert.match(exporter.export(report, "json"), /event-1/);
    assert.match(exporter.export(report, "csv"), /login/);
});

test("audit archive", () => {
    const archive = new AuditArchive();

    archive.archive(event());

    assert.equal(archive.count(), 1);
    assert.equal(archive.list()[0].event.id, "event-1");

    archive.clear();

    assert.equal(archive.count(), 0);
});

test("audit repository", () => {
    const repository = new InMemoryAuditRepository();

    repository.save(event());

    assert.equal(repository.get("event-1")?.action, "login");
    assert.equal(repository.list().length, 1);
    assert.equal(repository.remove("event-1"), true);
    assert.equal(repository.get("event-1"), undefined);
});

test("activity tracker and user tracker", () => {
    const tracker = new ActivityTracker({
        now: () => new Date("2026-03-01T00:00:00.000Z")
    });

    tracker.track("user-1", "login");
    tracker.track("user-1", "login");
    tracker.track("user-1", "logout");

    assert.equal(tracker.count("user-1"), 3);

    const users = new UserTracker(tracker);
    const summary = users.getUserSummary("user-1");

    assert.equal(summary.totalActivities, 3);
    assert.equal(summary.actions.login, 2);
    assert.equal(summary.actions.logout, 1);
    assert.equal(users.hasActivity("user-1", "login"), true);
    assert.equal(users.hasActivity("user-1", "delete"), false);
});
