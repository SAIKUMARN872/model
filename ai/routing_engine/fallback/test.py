from __future__ import annotations

from ai.routing_engine.constants import RoutingStatus
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)

from .fallback import FallbackEngine
from .recovery import RecoveryAction, RecoveryController
from .retry import RetryController, RetryPolicy


def build_candidates() -> list[ModelCandidate]:
    return [
        ModelCandidate(
            model_id="primary-model",
            provider="provider-a",
            tier="llm",
            quality=0.95,
            input_cost=1.00,
            output_cost=2.00,
            estimated_latency_ms=200.0,
        ),
        ModelCandidate(
            model_id="fallback-model",
            provider="provider-b",
            tier="llm",
            quality=0.90,
            input_cost=0.50,
            output_cost=1.00,
            estimated_latency_ms=150.0,
        ),
        ModelCandidate(
            model_id="disabled-model",
            provider="provider-c",
            tier="llm",
            quality=0.99,
            input_cost=0.10,
            output_cost=0.20,
            estimated_latency_ms=50.0,
            enabled=False,
        ),
    ]


def build_decision() -> RoutingDecision:
    return RoutingDecision(
        status=RoutingStatus.SELECTED,
        model_id="primary-model",
        provider="provider-a",
        tier="llm",
        score=0.95,
        candidates_considered=3,
    )


def test_retry() -> None:
    controller = RetryController(
        RetryPolicy(
            max_attempts=2,
            initial_delay_ms=100,
            max_delay_ms=1000,
        )
    )

    assert controller.should_retry(1) is True
    assert controller.should_retry(2) is False
    assert controller.delay_ms(1) == 100
    assert controller.delay_ms(2) == 200

    print("RETRY POLICY: PASS")


def test_recovery() -> None:
    controller = RecoveryController(
        max_retries=1,
    )

    retry = controller.decide(
        attempt=1,
        fallback_available=True,
    )

    fallback = controller.decide(
        attempt=2,
        fallback_available=True,
    )

    failure = controller.decide(
        attempt=2,
        fallback_available=False,
    )

    assert retry.action == RecoveryAction.RETRY
    assert fallback.action == RecoveryAction.FALLBACK
    assert failure.action == RecoveryAction.FAIL

    print("RECOVERY POLICY: PASS")


def test_fallback_selection() -> None:
    engine = FallbackEngine()

    decision = engine.plan(
        request=RoutingRequest(),
        primary_decision=build_decision(),
        candidates=build_candidates(),
        attempt=2,
    )

    assert decision.action == RecoveryAction.FALLBACK
    assert decision.primary_model == "primary-model"
    assert decision.fallback_model == "fallback-model"

    print("FALLBACK SELECTION: PASS")


def test_primary_excluded() -> None:
    engine = FallbackEngine()

    decision = engine.plan(
        request=RoutingRequest(),
        primary_decision=build_decision(),
        candidates=build_candidates(),
        attempt=2,
    )

    assert decision.fallback_model != "primary-model"

    print("PRIMARY MODEL EXCLUSION: PASS")


def test_disabled_excluded() -> None:
    candidates = build_candidates()

    enabled = [
        candidate
        for candidate in candidates
        if candidate.enabled
    ]

    assert "disabled-model" not in [
        candidate.model_id
        for candidate in enabled
    ]

    engine = FallbackEngine()

    decision = engine.plan(
        request=RoutingRequest(),
        primary_decision=build_decision(),
        candidates=candidates,
        attempt=2,
    )

    assert decision.fallback_model != "disabled-model"

    print("DISABLED MODEL EXCLUSION: PASS")


def test_no_fallback() -> None:
    engine = FallbackEngine()

    decision = engine.plan(
        request=RoutingRequest(),
        primary_decision=build_decision(),
        candidates=[
            ModelCandidate(
                model_id="primary-model",
                provider="provider-a",
                tier="llm",
            ),
        ],
        attempt=2,
    )

    assert decision.action == RecoveryAction.FAIL
    assert decision.fallback_model is None

    print("NO FALLBACK HANDLING: PASS")


def main() -> None:
    print("=" * 70)
    print("MODELNOW FALLBACK V1 TEST")
    print("=" * 70)

    test_retry()
    test_recovery()
    test_fallback_selection()
    test_primary_excluded()
    test_disabled_excluded()
    test_no_fallback()

    print("=" * 70)
    print("FALLBACK V1: PASS")
    print("=" * 70)


if __name__ == "__main__":
    main()
