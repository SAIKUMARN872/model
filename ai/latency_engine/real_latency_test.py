from __future__ import annotations

from ai.latency_engine.engine import LatencyEngine
from ai.latency_engine.models import LatencyObservation


def main() -> None:
    print("=" * 100)
    print("MODELNOW LATENCY ENGINE REAL INTEGRATION TEST")
    print("=" * 100)

    engine = LatencyEngine(
        max_records=100,
        min_samples=2,
        degradation_threshold_percent=25.0,
        default_sla_target_ms=200.0,
    )

    # ------------------------------------------------------------------
    # Realistic latency observations from different model/provider routes
    # ------------------------------------------------------------------
    observations = [
        # Fast SLM route
        LatencyObservation(
            request_id="req-001",
            model_id="slm-fast",
            provider="provider-a",
            tier="slm",
            total_latency_ms=90.0,
            ttft_ms=25.0,
            queue_latency_ms=5.0,
            generation_latency_ms=60.0,
            input_tokens=100,
            output_tokens=50,
            task_type="classification",
        ),
        LatencyObservation(
            request_id="req-002",
            model_id="slm-fast",
            provider="provider-a",
            tier="slm",
            total_latency_ms=110.0,
            ttft_ms=30.0,
            queue_latency_ms=5.0,
            generation_latency_ms=75.0,
            input_tokens=120,
            output_tokens=60,
            task_type="classification",
        ),
        LatencyObservation(
            request_id="req-003",
            model_id="slm-fast",
            provider="provider-a",
            tier="slm",
            total_latency_ms=100.0,
            ttft_ms=28.0,
            queue_latency_ms=7.0,
            generation_latency_ms=65.0,
            input_tokens=110,
            output_tokens=55,
            task_type="classification",
        ),

        # Balanced MLM route
        LatencyObservation(
            request_id="req-004",
            model_id="mlm-balanced",
            provider="provider-b",
            tier="mlm",
            total_latency_ms=170.0,
            ttft_ms=45.0,
            queue_latency_ms=10.0,
            generation_latency_ms=115.0,
            input_tokens=200,
            output_tokens=100,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-005",
            model_id="mlm-balanced",
            provider="provider-b",
            tier="mlm",
            total_latency_ms=190.0,
            ttft_ms=50.0,
            queue_latency_ms=15.0,
            generation_latency_ms=125.0,
            input_tokens=220,
            output_tokens=110,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-006",
            model_id="mlm-balanced",
            provider="provider-b",
            tier="mlm",
            total_latency_ms=180.0,
            ttft_ms=48.0,
            queue_latency_ms=12.0,
            generation_latency_ms=120.0,
            input_tokens=210,
            output_tokens=105,
            task_type="general",
        ),

        # Premium LLM route
        LatencyObservation(
            request_id="req-007",
            model_id="llm-premium",
            provider="provider-c",
            tier="llm",
            total_latency_ms=380.0,
            ttft_ms=90.0,
            queue_latency_ms=25.0,
            generation_latency_ms=265.0,
            input_tokens=500,
            output_tokens=250,
            task_type="reasoning",
        ),
        LatencyObservation(
            request_id="req-008",
            model_id="llm-premium",
            provider="provider-c",
            tier="llm",
            total_latency_ms=420.0,
            ttft_ms=100.0,
            queue_latency_ms=30.0,
            generation_latency_ms=290.0,
            input_tokens=550,
            output_tokens=280,
            task_type="reasoning",
        ),
        LatencyObservation(
            request_id="req-009",
            model_id="llm-premium",
            provider="provider-c",
            tier="llm",
            total_latency_ms=400.0,
            ttft_ms=95.0,
            queue_latency_ms=28.0,
            generation_latency_ms=277.0,
            input_tokens=525,
            output_tokens=265,
            task_type="reasoning",
        ),

        # Same model on another provider to test provider intelligence
        LatencyObservation(
            request_id="req-010",
            model_id="mlm-balanced",
            provider="provider-d",
            tier="mlm",
            total_latency_ms=130.0,
            ttft_ms=35.0,
            queue_latency_ms=8.0,
            generation_latency_ms=87.0,
            input_tokens=210,
            output_tokens=105,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-011",
            model_id="mlm-balanced",
            provider="provider-d",
            tier="mlm",
            total_latency_ms=150.0,
            ttft_ms=40.0,
            queue_latency_ms=10.0,
            generation_latency_ms=100.0,
            input_tokens=220,
            output_tokens=110,
            task_type="general",
        ),
        LatencyObservation(
            request_id="req-012",
            model_id="mlm-balanced",
            provider="provider-d",
            tier="mlm",
            total_latency_ms=140.0,
            ttft_ms=38.0,
            queue_latency_ms=9.0,
            generation_latency_ms=93.0,
            input_tokens=215,
            output_tokens=108,
            task_type="general",
        ),
    ]

    # ------------------------------------------------------------------
    # TEST 1 — Record observations
    # ------------------------------------------------------------------
    recorded = engine.record_many(observations)

    assert recorded == 12
    assert engine.count == 12

    print("TEST 1 - RECORD OBSERVATIONS: PASS")
    print(f"  Recorded observations: {recorded}")

    # ------------------------------------------------------------------
    # TEST 2 — Overall statistics
    # ------------------------------------------------------------------
    stats = engine.statistics()

    assert stats.samples == 12
    assert stats.minimum_ms == 90.0
    assert stats.maximum_ms == 420.0
    assert stats.average_ms > 0.0
    assert stats.p50_ms > 0.0
    assert stats.p95_ms >= stats.p50_ms
    assert stats.p99_ms >= stats.p95_ms

    print("TEST 2 - OVERALL LATENCY STATISTICS: PASS")
    print(f"  Average: {stats.average_ms:.2f} ms")
    print(f"  P50:     {stats.p50_ms:.2f} ms")
    print(f"  P95:     {stats.p95_ms:.2f} ms")
    print(f"  P99:     {stats.p99_ms:.2f} ms")

    # ------------------------------------------------------------------
    # TEST 3 — Fast SLM model statistics
    # ------------------------------------------------------------------
    slm_stats = engine.model_statistics("slm-fast")

    assert slm_stats.samples == 3
    assert slm_stats.average_ms == 100.0
    assert slm_stats.minimum_ms == 90.0
    assert slm_stats.maximum_ms == 110.0

    print("TEST 3 - SLM MODEL STATISTICS: PASS")
    print(f"  slm-fast average: {slm_stats.average_ms:.2f} ms")

    # ------------------------------------------------------------------
    # TEST 4 — Provider statistics
    # ------------------------------------------------------------------
    provider_d_stats = engine.provider_statistics("provider-d")

    assert provider_d_stats.samples == 3
    assert provider_d_stats.average_ms == 140.0

    print("TEST 4 - PROVIDER STATISTICS: PASS")
    print(f"  provider-d average: {provider_d_stats.average_ms:.2f} ms")

    # ------------------------------------------------------------------
    # TEST 5 — Historical latency prediction
    # ------------------------------------------------------------------
    prediction = engine.predict(
        model_id="mlm-balanced",
        provider="provider-d",
    )

    assert prediction.samples == 3
    assert prediction.predicted_latency_ms == provider_d_stats.p95_ms
    assert prediction.confidence > 0.0
    assert prediction.metadata["prediction_method"] == "historical_p95"

    print("TEST 5 - LATENCY PREDICTION: PASS")
    print(f"  Predicted P95: {prediction.predicted_latency_ms:.2f} ms")
    print(f"  Confidence:    {prediction.confidence:.2f}")

    # ------------------------------------------------------------------
    # TEST 6 — All model/provider predictions
    # ------------------------------------------------------------------
    predictions = engine.model_predictions()

    assert len(predictions) == 4

    prediction_keys = {
        (item.model_id, item.provider)
        for item in predictions
    }

    assert ("slm-fast", "provider-a") in prediction_keys
    assert ("mlm-balanced", "provider-b") in prediction_keys
    assert ("mlm-balanced", "provider-d") in prediction_keys
    assert ("llm-premium", "provider-c") in prediction_keys

    print("TEST 6 - MODEL/PROVIDER PREDICTIONS: PASS")
    for item in predictions:
        print(
            f"  {item.model_id:<18} "
            f"{item.provider:<12} "
            f"P95={item.predicted_latency_ms:.2f} ms"
        )

    # ------------------------------------------------------------------
    # TEST 7 — SLA compliance
    # ------------------------------------------------------------------
    compliant = engine.check_sla(
        actual_latency_ms=150.0,
        target_latency_ms=200.0,
    )

    assert compliant.compliant is True
    assert compliant.margin_ms == 50.0
    assert compliant.utilization == 0.75

    print("TEST 7 - SLA COMPLIANCE: PASS")
    print(f"  150 ms against 200 ms SLA -> compliant")

    # ------------------------------------------------------------------
    # TEST 8 — SLA breach
    # ------------------------------------------------------------------
    breach = engine.check_sla(
        actual_latency_ms=350.0,
        target_latency_ms=200.0,
    )

    assert breach.compliant is False
    assert breach.margin_ms == -150.0
    assert breach.utilization == 1.75

    print("TEST 8 - SLA BREACH: PASS")
    print(f"  350 ms against 200 ms SLA -> breach")

    # ------------------------------------------------------------------
    # TEST 9 — Latency degradation detection
    # ------------------------------------------------------------------
    degradation = engine.detect_degradation(
        model_id="mlm-balanced",
        provider="provider-b",
        baseline_latency_ms=160.0,
        current_latency_ms=220.0,
    )

    assert degradation.increase_percent == 37.5
    assert degradation.degraded is True
    assert degradation.threshold_percent == 25.0

    print("TEST 9 - DEGRADATION DETECTION: PASS")
    print(f"  Increase: {degradation.increase_percent:.2f}%")
    print(f"  Degraded: {degradation.degraded}")

    # ------------------------------------------------------------------
    # TEST 10 — Healthy latency detection
    # ------------------------------------------------------------------
    healthy = engine.detect_degradation(
        model_id="slm-fast",
        provider="provider-a",
        baseline_latency_ms=100.0,
        current_latency_ms=110.0,
    )

    assert healthy.increase_percent == 10.0
    assert healthy.degraded is False

    print("TEST 10 - HEALTHY LATENCY: PASS")
    print(f"  Increase: {healthy.increase_percent:.2f}%")
    print(f"  Degraded: {healthy.degraded}")

    # ------------------------------------------------------------------
    # TEST 11 — Faster route identification
    # ------------------------------------------------------------------
    provider_b = engine.provider_statistics("provider-b")
    provider_d = engine.provider_statistics("provider-d")

    assert provider_d.average_ms < provider_b.average_ms

    print("TEST 11 - FASTER ROUTE IDENTIFICATION: PASS")
    print(
        f"  provider-d: {provider_d.average_ms:.2f} ms "
        f"< provider-b: {provider_b.average_ms:.2f} ms"
    )

    # ------------------------------------------------------------------
    # TEST 12 — History retention
    # ------------------------------------------------------------------
    assert engine.count == 12
    assert len(engine.records()) == 12

    print("TEST 12 - HISTORY RETENTION: PASS")

    print("=" * 100)
    print("PASS - MODELNOW LATENCY ENGINE REAL INTEGRATION TEST")
    print(
        "      Latency observations were recorded and analyzed across"
    )
    print(
        "      model/provider routes, predictions, SLA compliance,"
    )
    print(
        "      degradation detection, and latency-aware comparison."
    )
    print("=" * 100)


if __name__ == "__main__":
    main()
