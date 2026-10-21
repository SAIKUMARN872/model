from __future__ import annotations

from ai.routing_engine.models import ModelCandidate

from .models import AdaptiveModelSignal, AdaptiveRoutingScore


def normalized_signal_quality(signal: AdaptiveModelSignal) -> float:
    if signal.quality_score is None:
        return 0.0
    return max(0.0, min(1.0, float(signal.quality_score)))


def normalized_signal_cost(
    signal: AdaptiveModelSignal,
    candidates: list[ModelCandidate],
    signals: dict[str, AdaptiveModelSignal] | None = None,
) -> float:
    """Compare observed per-request costs, never catalog price rates."""
    import math

    if signal.cost is None:
        return 0.5

    own_cost = float(signal.cost)
    if not math.isfinite(own_cost) or own_cost < 0.0:
        return 0.5

    comparable_costs = []
    if signals is not None:
        for model_id, other_signal in signals.items():
            if model_id == signal.model_id or other_signal.cost is None:
                continue

            cost = float(other_signal.cost)
            if math.isfinite(cost) and cost >= 0.0:
                comparable_costs.append(cost)

    if not comparable_costs:
        return 0.5

    minimum = min([own_cost, *comparable_costs])
    maximum = max([own_cost, *comparable_costs])

    if maximum == minimum:
        return 0.5

    return max(
        0.0,
        min(1.0, 1.0 - ((own_cost - minimum) / (maximum - minimum))),
    )


def normalized_signal_latency(
    signal: AdaptiveModelSignal,
    candidates: list[ModelCandidate],
    signals: dict[str, AdaptiveModelSignal] | None = None,
) -> float:
    """Compare observed per-request latency across comparable history."""
    import math

    if signal.latency_ms is None:
        return 0.5

    own_latency = float(signal.latency_ms)
    if not math.isfinite(own_latency) or own_latency < 0.0:
        return 0.5

    comparable_latencies = []
    if signals is not None:
        for model_id, other_signal in signals.items():
            if model_id == signal.model_id:
                continue

            if other_signal.latency_ms is None:
                continue

            latency = float(other_signal.latency_ms)
            if math.isfinite(latency) and latency >= 0.0:
                comparable_latencies.append(latency)

    if not comparable_latencies:
        return 0.5

    minimum = min([own_latency, *comparable_latencies])
    maximum = max([own_latency, *comparable_latencies])

    if maximum == minimum:
        return 0.5

    return max(
        0.0,
        min(
            1.0,
            1.0 - ((own_latency - minimum) / (maximum - minimum)),
        ),
    )


def adaptive_signal_score(
    signal: AdaptiveModelSignal,
    candidates: list[ModelCandidate],
    quality_weight: float = 0.50,
    cost_weight: float = 0.25,
    latency_weight: float = 0.25,
    signals: dict[str, AdaptiveModelSignal] | None = None,
) -> float:
    quality = normalized_signal_quality(signal)
    cost = normalized_signal_cost(signal, candidates, signals=signals)
    latency = normalized_signal_latency(
        signal, candidates, signals=signals
    )

    performance_score = (
        (quality * quality_weight)
        + (cost * cost_weight)
        + (latency * latency_weight)
    )

    success_rate = (
        1.0
        if signal.success_rate is None
        else max(0.0, min(1.0, float(signal.success_rate)))
    )

    reward = (
        0.0
        if signal.reward is None
        else max(-1.0, min(1.0, float(signal.reward)))
    )

    reward_score = (reward + 1.0) / 2.0

    reliability_score = (
        (success_rate * 0.70)
        + (reward_score * 0.30)
    )

    return (
        (performance_score * 0.80)
        + (reliability_score * 0.20)
    )


def combine_adaptive_score(
    candidate: ModelCandidate,
    base_score: float,
    signal: AdaptiveModelSignal | None,
    candidates: list[ModelCandidate],
    quality_weight: float = 0.50,
    cost_weight: float = 0.25,
    latency_weight: float = 0.25,
    signals: dict[str, AdaptiveModelSignal] | None = None,
) -> AdaptiveRoutingScore:
    if signal is None:
        return AdaptiveRoutingScore(
            model_id=candidate.model_id,
            score=base_score,
            base_score=base_score,
            adaptive_score=base_score,
            signal=None,
            metadata={
                "adaptive_applied": False,
                "confidence": 0.0,
            },
        )

    adaptive_score = adaptive_signal_score(
        signal,
        candidates,
        quality_weight=quality_weight,
        cost_weight=cost_weight,
        latency_weight=latency_weight,
        signals=signals,
    )

    confidence = max(0.0, min(1.0, signal.confidence))

    final_score = (
        (base_score * (1.0 - confidence))
        + (adaptive_score * confidence)
    )

    return AdaptiveRoutingScore(
        model_id=candidate.model_id,
        score=final_score,
        base_score=base_score,
        adaptive_score=adaptive_score,
        signal=signal,
        metadata={
            "adaptive_applied": True,
            "confidence": confidence,
        },
    )


__all__ = [
    "normalized_signal_quality",
    "normalized_signal_cost",
    "normalized_signal_latency",
    "adaptive_signal_score",
    "combine_adaptive_score",
]
