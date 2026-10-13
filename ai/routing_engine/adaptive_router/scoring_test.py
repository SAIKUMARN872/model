import math

from ai.routing_engine.adaptive_router.models import AdaptiveModelSignal
from ai.routing_engine.adaptive_router.scoring import (
    adaptive_signal_score,
    combine_adaptive_score,
    normalized_signal_cost,
    normalized_signal_latency,
)
from ai.routing_engine.models import ModelCandidate


def make_candidate(
    model_id: str,
    quality: float,
    input_cost: float,
    output_cost: float,
    latency: float,
) -> ModelCandidate:
    return ModelCandidate(
        model_id=model_id,
        provider="test-provider",
        tier="SLM",
        quality=quality,
        input_cost=input_cost,
        output_cost=output_cost,
        estimated_latency_ms=latency,
    )


def main() -> None:
    candidates = [
        make_candidate("cheap-slm", 0.80, 0.05, 0.10, 80.0),
        make_candidate("balanced-slm", 0.90, 0.20, 0.30, 120.0),
        make_candidate("quality-slm", 0.98, 0.60, 0.80, 250.0),
    ]

    signal = AdaptiveModelSignal(
        model_id="quality-slm",
        samples=10,
        quality_score=0.98,
        latency_ms=250.0,
        cost=1.40,
        success_rate=1.0,
        reward=1.0,
        confidence=1.0,
    )

    historical_signals = {
        "cheap-slm": AdaptiveModelSignal(
            model_id="cheap-slm",
            samples=10,
            quality_score=0.80,
            latency_ms=80.0,
            cost=0.20,
            success_rate=1.0,
            reward=0.5,
            confidence=1.0,
        ),
        "balanced-slm": AdaptiveModelSignal(
            model_id="balanced-slm",
            samples=10,
            quality_score=0.90,
            latency_ms=120.0,
            cost=0.80,
            success_rate=1.0,
            reward=0.5,
            confidence=1.0,
        ),
        "quality-slm": signal,
    }

    assert normalized_signal_cost(signal, candidates) == 0.5
    assert normalized_signal_cost(
        historical_signals["cheap-slm"],
        candidates,
        signals=historical_signals,
    ) == 1.0
    assert math.isclose(
        normalized_signal_cost(
            historical_signals["balanced-slm"],
            candidates,
            signals=historical_signals,
        ),
        0.5,
    )
    assert normalized_signal_cost(
        signal,
        candidates,
        signals=historical_signals,
    ) == 0.0

    assert normalized_signal_cost(
        signal,
        candidates,
        signals={"quality-slm": signal},
    ) == 0.5

    print("HISTORICAL COST NORMALIZATION: PASS")
    print("NO COMPARABLE COST HISTORY: PASS")

    assert normalized_signal_latency(
        historical_signals["cheap-slm"],
        candidates,
        signals=historical_signals,
    ) == 1.0
    assert math.isclose(
        normalized_signal_latency(
            historical_signals["balanced-slm"],
            candidates,
            signals=historical_signals,
        ),
        1.0 - ((120.0 - 80.0) / (250.0 - 80.0)),
    )
    assert normalized_signal_latency(
        historical_signals["quality-slm"],
        candidates,
        signals=historical_signals,
    ) == 0.0
    assert normalized_signal_latency(
        signal,
        candidates,
    ) == 0.5

    invalid_latency_signal = AdaptiveModelSignal(
        model_id="invalid-latency",
        samples=1,
        quality_score=0.5,
        latency_ms=float("nan"),
        cost=0.5,
        success_rate=1.0,
        reward=0.0,
        confidence=1.0,
    )
    assert normalized_signal_latency(
        invalid_latency_signal,
        candidates,
        signals=historical_signals,
    ) == 0.5

    print("HISTORICAL LATENCY NORMALIZATION: PASS")
    print("NO COMPARABLE LATENCY HISTORY: PASS")
    print("INVALID LATENCY FALLBACK: PASS")

    adaptive_score = adaptive_signal_score(
        signal,
        candidates,
        quality_weight=0.90,
        cost_weight=0.05,
        latency_weight=0.05,
        signals=historical_signals,
    )

    assert 0.0 <= adaptive_score <= 1.0
    print(f"ADAPTIVE SCORE: {adaptive_score}")
    print("ADAPTIVE SCORE RANGE: PASS")

    result = combine_adaptive_score(
        candidates[2],
        base_score=0.40,
        signal=signal,
        candidates=candidates,
        quality_weight=0.90,
        cost_weight=0.05,
        latency_weight=0.05,
        signals=historical_signals,
    )

    assert result.model_id == "quality-slm"
    assert result.base_score == 0.40
    assert math.isclose(
        result.score,
        result.adaptive_score,
        rel_tol=1e-9,
    )
    assert result.metadata["adaptive_applied"] is True
    assert result.metadata["confidence"] == 1.0

    print(f"BASE SCORE: {result.base_score}")
    print(f"ADAPTIVE SCORE: {result.adaptive_score}")
    print(f"FINAL SCORE: {result.score}")
    print("FULL-CONFIDENCE ADAPTIVE BLEND: PASS")

    partial_signal = AdaptiveModelSignal(
        model_id="quality-slm",
        samples=2,
        quality_score=0.98,
        latency_ms=250.0,
        cost=1.40,
        success_rate=1.0,
        reward=1.0,
        confidence=0.20,
    )

    partial = combine_adaptive_score(
        candidates[2],
        base_score=0.40,
        signal=partial_signal,
        candidates=candidates,
        quality_weight=0.90,
        cost_weight=0.05,
        latency_weight=0.05,
        signals=historical_signals,
    )

    expected = (
        (0.40 * 0.80)
        + (partial.adaptive_score * 0.20)
    )

    assert math.isclose(
        partial.score,
        expected,
        rel_tol=1e-9,
    )

    print(f"PARTIAL CONFIDENCE SCORE: {partial.score}")
    print("CONFIDENCE-WEIGHTED BLEND: PASS")

    no_signal = combine_adaptive_score(
        candidates[0],
        base_score=0.75,
        signal=None,
        candidates=candidates,
    )

    assert no_signal.score == 0.75
    assert no_signal.base_score == 0.75
    assert no_signal.adaptive_score == 0.75
    assert no_signal.metadata["adaptive_applied"] is False

    print("NO SIGNAL FALLBACK: PASS")
    print("ADAPTIVE SCORING: PASS")


if __name__ == "__main__":
    main()
