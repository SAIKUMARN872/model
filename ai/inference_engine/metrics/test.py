from __future__ import annotations

import time

from ai.inference_engine.metrics import (
    InferenceMetrics,
    InferenceProfiler,
    InferenceTelemetryEvent,
    MetricsRegistry,
    TelemetryCollector,
)


def main() -> None:
    metrics = InferenceMetrics()

    metrics.record_success(
        input_tokens=10,
        output_tokens=20,
        total_tokens=30,
        estimated_cost=0.05,
        latency_ms=100.0,
        time_to_first_token_ms=25.0,
    )

    metrics.record_success(
        input_tokens=20,
        output_tokens=30,
        total_tokens=50,
        estimated_cost=0.10,
        latency_ms=200.0,
        time_to_first_token_ms=35.0,
    )

    metrics.record_failure()

    assert metrics.request_count == 3
    assert metrics.success_count == 2
    assert metrics.failure_count == 1

    assert metrics.input_tokens == 30
    assert metrics.output_tokens == 50
    assert metrics.total_tokens == 80

    assert abs(metrics.estimated_cost - 0.15) < 1e-9
    assert metrics.average_latency_ms == 150.0
    assert metrics.average_ttft_ms == 30.0
    assert (
        metrics.success_rate
        == 2 / 3
    )

    print("METRIC AGGREGATION: PASS")

    registry = MetricsRegistry()

    registry.record_success(
        backend="transformers",
        model="mock-model",
        input_tokens=10,
        output_tokens=20,
        total_tokens=30,
        estimated_cost=0.05,
        latency_ms=100.0,
        time_to_first_token_ms=25.0,
    )

    registry.record_failure(
        backend="transformers",
        model="mock-model",
    )

    assert (
        registry.overall.request_count
        == 2
    )

    assert (
        registry.by_backend[
            "transformers"
        ].request_count
        == 2
    )

    assert (
        registry.by_model[
            "mock-model"
        ].request_count
        == 2
    )

    print("BACKEND METRICS: PASS")
    print("MODEL METRICS: PASS")

    profiler = InferenceProfiler()

    profiler.start()
    time.sleep(0.001)
    elapsed = profiler.stop()

    assert elapsed > 0
    assert profiler.elapsed_ms > 0

    print("PROFILER: PASS")

    collector = TelemetryCollector()

    event = InferenceTelemetryEvent(
        event_type="inference.completed",
        request_id="mock-request",
        model="mock-model",
        backend="transformers",
    )

    collector.record(event)

    assert len(collector.events) == 1
    assert (
        collector.events[0].event_type
        == "inference.completed"
    )

    collector.clear()

    assert len(collector.events) == 0

    print("TELEMETRY: PASS")
    print("METRICS TEST: PASS")


if __name__ == "__main__":
    main()
