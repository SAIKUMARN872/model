from __future__ import annotations

from time import sleep

from .alerts import (
    AlertSeverity,
    AlertStatus,
    LatencyAlertManager,
)
from .latency_metrics import LatencyMetricsCollector
from .profiler import LatencyProfiler
from .telemetry import LatencyTelemetry


def main() -> None:
    metrics = LatencyMetricsCollector(
        max_samples=5,
    )

    metrics.record(
        100.0,
        ttft_ms=20.0,
        queue_ms=10.0,
        generation_ms=70.0,
    )

    metrics.record(
        200.0,
        ttft_ms=30.0,
        queue_ms=20.0,
        generation_ms=150.0,
    )

    metrics.record(
        300.0,
        ttft_ms=40.0,
        queue_ms=30.0,
        generation_ms=230.0,
    )

    snapshot = metrics.snapshot()

    assert snapshot.samples == 3
    assert snapshot.average_ms == 200.0
    assert snapshot.p50_ms == 200.0
    assert snapshot.p95_ms > 200.0
    assert snapshot.p99_ms > snapshot.p95_ms
    assert snapshot.min_ms == 100.0
    assert snapshot.max_ms == 300.0
    assert snapshot.average_ttft_ms == 30.0
    assert snapshot.average_queue_ms == 20.0
    assert snapshot.average_generation_ms == 150.0

    print("LATENCY METRICS: PASS")

    metrics.record_many(
        [
            {"latency_ms": 400.0},
            {"latency_ms": 500.0},
            {"latency_ms": 600.0},
        ]
    )

    assert metrics.samples == 5
    assert metrics.latencies() == (
        200.0,
        300.0,
        400.0,
        500.0,
        600.0,
    )

    print("METRICS HISTORY LIMIT: PASS")

    metrics.clear()

    assert metrics.samples == 0
    assert metrics.snapshot().average_ms == 0.0

    print("METRICS CLEAR: PASS")

    profiler = LatencyProfiler()

    session = profiler.start("request-001")

    with session.stage("routing"):
        sleep(0.001)

    with session.stage("inference"):
        sleep(0.001)

    session.set_metadata(
        "model_id",
        "openai:gpt-5",
    )

    profile = session.finish()

    assert profile.request_id == "request-001"
    assert profile.total_latency_ms >= 0.0
    assert len(profile.stages) == 2
    assert profile.stages[0].name == "routing"
    assert profile.stages[1].name == "inference"
    assert (
        profile.metadata["model_id"]
        == "openai:gpt-5"
    )

    print("LATENCY PROFILER: PASS")

    latest = profiler.latest("request-001")

    assert latest is not None
    assert latest.request_id == "request-001"

    print("PROFILER HISTORY: PASS")

    received = []

    telemetry = LatencyTelemetry(
        max_events=3,
    )

    def handler(event) -> None:
        received.append(event)

    telemetry.subscribe(handler)

    event = telemetry.emit(
        "request.completed",
        request_id="request-001",
        duration_ms=125.5,
        attributes={
            "model_id": "openai:gpt-5",
            "tier": "llm",
        },
    )

    assert event.name == "request.completed"
    assert event.request_id == "request-001"
    assert event.duration_ms == 125.5
    assert event.attributes["tier"] == "llm"
    assert len(received) == 1

    print("TELEMETRY EMISSION: PASS")

    telemetry.emit("request.started")
    telemetry.emit("request.failed")

    assert telemetry.counter("request.completed") == 1
    assert telemetry.counter("request.started") == 1
    assert telemetry.counter("request.failed") == 1

    assert len(telemetry.events()) == 3

    print("TELEMETRY COUNTERS: PASS")

    telemetry.unsubscribe(handler)

    telemetry.emit("request.completed")

    assert len(received) == 3
    assert telemetry.counter("request.completed") == 2

    print("TELEMETRY SUBSCRIPTION: PASS")

    alert_manager = LatencyAlertManager()

    alert = alert_manager.evaluate(
        alert_id="latency-001",
        name="High Request Latency",
        latency_ms=1500.0,
        threshold_ms=1000.0,
        request_id="request-001",
        severity=AlertSeverity.CRITICAL,
        metadata={
            "model_id": "openai:gpt-5",
        },
    )

    assert alert is not None
    assert alert.status == AlertStatus.ACTIVE
    assert alert.severity == AlertSeverity.CRITICAL
    assert alert.actual_latency_ms == 1500.0
    assert alert.threshold_ms == 1000.0

    print("LATENCY ALERT: PASS")

    assert len(alert_manager.active()) == 1

    resolved = alert_manager.evaluate(
        alert_id="latency-001",
        name="High Request Latency",
        latency_ms=500.0,
        threshold_ms=1000.0,
    )

    assert resolved is None

    stored = alert_manager.get("latency-001")

    assert stored is not None
    assert stored.status == AlertStatus.RESOLVED

    print("ALERT RESOLUTION: PASS")

    second_alert = alert_manager.evaluate(
        alert_id="latency-002",
        name="Provider Latency",
        latency_ms=2500.0,
        threshold_ms=1000.0,
    )

    assert second_alert is not None
    assert len(alert_manager.active()) == 1
    assert len(alert_manager.resolved()) == 1

    print("ALERT TRACKING: PASS")

    alert_manager.clear()

    assert len(alert_manager.all()) == 0

    print("ALERT CLEAR: PASS")

    print("MODELNOW LATENCY MONITORING TEST: PASS")


if __name__ == "__main__":
    main()

