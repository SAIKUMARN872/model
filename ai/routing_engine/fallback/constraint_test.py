from __future__ import annotations

from ai.routing_engine.constants import RoutingStatus
from ai.routing_engine.fallback.fallback import FallbackEngine
from ai.routing_engine.fallback.recovery import RecoveryAction
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)


def candidate(
    model_id: str,
    *,
    quality: float = 0.9,
    input_cost: float = 1.0,
    output_cost: float = 1.0,
    latency: float | None = 100.0,
    capabilities: tuple[str, ...] = ("chat", "streaming"),
    tier: str = "llm",
    enabled: bool = True,
) -> ModelCandidate:
    return ModelCandidate(
        model_id=model_id,
        provider="test-provider",
        tier=tier,
        quality=quality,
        input_cost=input_cost,
        output_cost=output_cost,
        estimated_latency_ms=latency,
        capabilities=capabilities,
        enabled=enabled,
    )


def primary_decision() -> RoutingDecision:
    return RoutingDecision(
        status=RoutingStatus.SELECTED,
        model_id="primary",
        provider="test-provider",
        tier="llm",
        score=0.95,
    )


def plan(request: RoutingRequest, candidates: list[ModelCandidate]):
    return FallbackEngine().plan(
        request=request,
        primary_decision=primary_decision(),
        candidates=candidates,
        attempt=2,
    )


def test_quality_constraint() -> None:
    result = plan(
        RoutingRequest(min_quality=0.8),
        [
            candidate("primary"),
            candidate("low-quality", quality=0.5),
            candidate("eligible", quality=0.85),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK MINIMUM QUALITY: PASS")


def test_latency_constraint() -> None:
    result = plan(
        RoutingRequest(max_latency_ms=100),
        [
            candidate("primary"),
            candidate("slow", latency=101),
            candidate("eligible", latency=80),
            candidate("unknown-latency", latency=None),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK MAXIMUM LATENCY: PASS")


def test_capability_constraint() -> None:
    result = plan(
        RoutingRequest(required_capabilities=("vision",)),
        [
            candidate("primary"),
            candidate("no-vision", capabilities=("chat",)),
            candidate("eligible", capabilities=("chat", "vision")),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK REQUIRED CAPABILITIES: PASS")


def test_tier_constraint() -> None:
    result = plan(
        RoutingRequest(preferred_tier="mlm"),
        [
            candidate("primary"),
            candidate("wrong-tier", tier="llm", quality=0.99),
            candidate("eligible", tier="mlm", quality=0.85),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK PREFERRED TIER: PASS")


def test_explicit_budget_constraint() -> None:
    request = RoutingRequest(
        max_cost=0.00001,
        metadata={
            "estimated_input_tokens": 1000,
            "estimated_output_tokens": 1000,
            "explicit_max_cost": True,
        },
    )
    result = plan(
        request,
        [
            candidate("primary"),
            candidate("too-expensive", quality=0.99, input_cost=10, output_cost=10),
            candidate("eligible", quality=0.85, input_cost=0.005, output_cost=0.005),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK EXPLICIT BUDGET: PASS")


def test_budget_fails_closed_without_token_estimates() -> None:
    request = RoutingRequest(
        max_cost=1.0,
        metadata={"explicit_max_cost": True},
    )
    result = plan(
        request,
        [candidate("primary"), candidate("unknown-cost")],
    )
    assert result.action == RecoveryAction.FAIL
    assert result.fallback_model is None
    print("FALLBACK UNKNOWN BUDGET ESTIMATE: PASS")


def test_streaming_constraint() -> None:
    result = plan(
        RoutingRequest(stream=True),
        [
            candidate("primary"),
            candidate("not-streaming", capabilities=("chat",)),
            candidate("eligible", capabilities=("chat", "streaming")),
        ],
    )
    assert result.action == RecoveryAction.FALLBACK
    assert result.fallback_model == "eligible"
    print("FALLBACK STREAMING CAPABILITY: PASS")


def test_no_eligible_fallback() -> None:
    result = plan(
        RoutingRequest(min_quality=0.99),
        [
            candidate("primary"),
            candidate("ineligible", quality=0.8),
        ],
    )
    assert result.action == RecoveryAction.FAIL
    assert result.fallback_model is None
    print("FALLBACK NO ELIGIBLE MODEL: PASS")


def main() -> None:
    print("=" * 68)
    print("MODELNOW FALLBACK CONSTRAINT TESTS")
    print("=" * 68)
    test_quality_constraint()
    test_latency_constraint()
    test_capability_constraint()
    test_tier_constraint()
    test_explicit_budget_constraint()
    test_budget_fails_closed_without_token_estimates()
    test_streaming_constraint()
    test_no_eligible_fallback()
    print("MODELNOW FALLBACK CONSTRAINT TESTS: PASS")


if __name__ == "__main__":
    main()

