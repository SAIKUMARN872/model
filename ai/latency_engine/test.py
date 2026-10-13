from __future__ import annotations

from .engine import LatencyEngine
from .models import LatencyObservation


def main() -> None:
    engine = LatencyEngine(
        max_records=100,
        min_samples=1,
        degradation_threshold_percent=25.0,
        default_sla_target_ms=200.0,
    )

    observations = [
        LatencyObservation(
            request_id="req-001",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            total_latency_ms=100.0,
            ttft_ms=30.0,
            queue_latency_ms=10.0,
            generation_latency_ms=60.0,
            input_tokens=100,
            output_tokens=50,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-002",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            total_latency_ms=150.0,
            ttft_ms=40.0,
            queue_latency_ms=15.0,
            generation_latency_ms=95.0,
            input_tokens=120,
            output_tokens=60,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-003",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            total_latency_ms=200.0,
            ttft_ms=50.0,
            queue_latency_ms=20.0,
            generation_latency_ms=130.0,
            input_tokens=150,
            output_tokens=70,
            task_type="coding",
        ),
        LatencyObservation(
            request_id="req-004",
            model_id="qwen:test-mlm",
            provider="qwen",
            tier="mlm",
            total_latency_ms=80.0,
            ttft_ms=20.0,
            queue_latency_ms=5.0,
            generation_latency_ms=55.0,
            input_tokens=80,
            output_tokens=40,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-005",
            model_id="qwen:test-mlm",
            provider="qwen",
            tier="mlm",
            total_latency_ms=120.0,
            ttft_ms=25.0,
            queue_latency_ms=8.0,
            generation_latency_ms=87.0,
            input_tokens=90,
            output_tokens=45,
            task_type="general",
        ),
    ]

    engine.record_many(observations)

    assert engine.count == 5
    print("RECORDING: PASS")

    statistics = engine.statistics()

    assert statistics.samples == 5
    assert statistics.average_ms == 130.0
    assert statistics.p50_ms == 120.0
    assert statistics.p95_ms >= 150.0
    assert statistics.p99_ms >= statistics.p95_ms
    assert statistics.minimum_ms == 80.0
    assert statistics.maximum_ms == 200.0
    print("STATISTICS: PASS")

    model_stats = engine.model_statistics(
        "openai:gpt-5",
    )

    assert model_stats.samples == 3
    assert model_stats.minimum_ms == 100.0
    assert model_stats.maximum_ms == 200.0
    print("MODEL STATISTICS: PASS")

    provider_stats = engine.provider_statistics(
        "qwen",
    )

    assert provider_stats.samples == 2
    assert provider_stats.average_ms == 100.0
    print("PROVIDER STATISTICS: PASS")

    prediction = engine.predict(
        model_id="openai:gpt-5",
        provider="openai",
    )

    assert prediction.model_id == "openai:gpt-5"
    assert prediction.provider == "openai"
    assert prediction.predicted_latency_ms == 195.0
    assert prediction.samples == 3
    assert prediction.confidence > 0.0
    print("LATENCY PREDICTION: PASS")

    compliant = engine.check_sla(
        actual_latency_ms=150.0,
        target_latency_ms=200.0,
    )

    assert compliant.compliant is True
    assert compliant.margin_ms == 50.0
    assert compliant.utilization == 0.75
    print("SLA COMPLIANCE: PASS")

    breached = engine.check_sla(
        actual_latency_ms=250.0,
        target_latency_ms=200.0,
    )

    assert breached.compliant is False
    assert breached.margin_ms == -50.0
    assert breached.utilization == 1.25
    print("SLA BREACH: PASS")

    degradation = engine.detect_degradation(
        model_id="openai:gpt-5",
        provider="openai",
        baseline_latency_ms=100.0,
        current_latency_ms=130.0,
    )

    assert degradation.degraded is True
    assert degradation.increase_percent == 30.0
    print("DEGRADATION DETECTION: PASS")

    healthy = engine.detect_degradation(
        model_id="qwen:test-mlm",
        provider="qwen",
        baseline_latency_ms=100.0,
        current_latency_ms=110.0,
    )

    assert healthy.degraded is False
    assert healthy.increase_percent == 10.0
    print("HEALTHY LATENCY: PASS")

    predictions = engine.model_predictions()

    assert len(predictions) == 2
    assert {
        prediction.model_id
        for prediction in predictions
    } == {
        "openai:gpt-5",
        "qwen:test-mlm",
    }
    print("MODEL PREDICTIONS: PASS")

    invalid_observation = False

    try:
        LatencyObservation(
            request_id="req-invalid",
            model_id="test:model",
            provider="test",
            tier="slm",
            total_latency_ms=-1.0,
        )
    except ValueError:
        invalid_observation = True

    assert invalid_observation is True
    print("VALIDATION: PASS")

    limited_engine = LatencyEngine(
        max_records=2,
    )

    limited_engine.record(
        observations[0],
    )
    limited_engine.record(
        observations[1],
    )
    limited_engine.record(
        observations[2],
    )

    assert limited_engine.count == 2
    assert (
        limited_engine.records()[0].request_id
        == "req-002"
    )
    print("HISTORY LIMIT: PASS")

    print("MODELNOW LATENCY ENGINE TEST: PASS")


if __name__ == "__main__":
    main()
