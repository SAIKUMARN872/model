from decimal import Decimal

from ai.optimization_engine.engine import OptimizationEngine
from ai.optimization_engine.models import (
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationWeights,
)


CANDIDATES = [
    OptimizationCandidate(
        model="slm-fast",
        provider="provider-a",
        estimated_cost=Decimal("0.001"),
        estimated_latency_ms=Decimal("100"),
        quality_score=Decimal("0.72"),
        metadata={"tier": "SLM"},
    ),
    OptimizationCandidate(
        model="mlm-balanced",
        provider="provider-b",
        estimated_cost=Decimal("0.004"),
        estimated_latency_ms=Decimal("180"),
        quality_score=Decimal("0.88"),
        metadata={"tier": "MLM"},
    ),
    OptimizationCandidate(
        model="llm-premium",
        provider="provider-c",
        estimated_cost=Decimal("0.020"),
        estimated_latency_ms=Decimal("450"),
        quality_score=Decimal("0.97"),
        metadata={"tier": "LLM"},
    ),
    OptimizationCandidate(
        model="mlm-fast",
        provider="provider-d",
        estimated_cost=Decimal("0.006"),
        estimated_latency_ms=Decimal("80"),
        quality_score=Decimal("0.84"),
        metadata={"tier": "MLM"},
    ),
]


def run_test(name, request, expected):
    engine = OptimizationEngine()
    result = engine.optimize(request)

    print()
    print("-" * 100)
    print(name)
    print("-" * 100)

    print(f"Selected model:      {result.decision.selected_model}")
    print(f"Selected provider:   {result.decision.selected_provider}")
    print(f"Action:              {result.decision.action.value}")
    print(f"Objective:           {result.decision.objective.value}")
    print(f"Candidates:          {result.candidates_evaluated}")
    print(f"Feasible:            {result.candidates_feasible}")
    print(f"Optimized cost:      {result.optimized_cost}")
    print(f"Optimized latency:   {result.optimized_latency_ms} ms")
    print(f"Optimized quality:   {result.optimized_quality}")

    if expected.get("model") is not None:
        assert result.decision.selected_model == expected["model"]

    if expected.get("provider") is not None:
        assert result.decision.selected_provider == expected["provider"]

    if expected.get("cost") is not None:
        assert result.optimized_cost == expected["cost"]

    if expected.get("latency") is not None:
        assert result.optimized_latency_ms == expected["latency"]

    if expected.get("quality") is not None:
        assert result.optimized_quality == expected["quality"]

    if expected.get("max_cost") is not None:
        assert result.optimized_cost <= expected["max_cost"]

    if expected.get("max_latency") is not None:
        assert result.optimized_latency_ms <= expected["max_latency"]

    if expected.get("min_quality") is not None:
        assert result.optimized_quality >= expected["min_quality"]

    print("RESULT: PASS")

    return result


def main():
    print("=" * 100)
    print("MODELNOW REAL AUTOMATIC OPTIMIZATION TEST")
    print("=" * 100)

    print()
    print(f"REGISTERED CANDIDATES: {len(CANDIDATES)}")

    for candidate in CANDIDATES:
        print(
            f"  {candidate.model:<20} "
            f"provider={candidate.provider:<12} "
            f"cost={candidate.estimated_cost:<8} "
            f"latency={candidate.estimated_latency_ms:<6} "
            f"quality={candidate.quality_score}"
        )

    # ------------------------------------------------------------------
    # TEST 1: COST PRIORITY
    # ------------------------------------------------------------------

    cost_result = run_test(
        "TEST 1 - AUTOMATIC COST OPTIMIZATION",
        OptimizationRequest(
            model="llm-premium",
            provider="provider-c",
            objective=OptimizationObjective.COST,
            weights=OptimizationWeights(
                cost=Decimal("0.90"),
                latency=Decimal("0.08"),
                quality=Decimal("0.02"),
            ),
            candidates=CANDIDATES,
            request_id="auto-cost-001",
            metadata={"scenario": "cost_priority"},
        ),
        {
            "model": "slm-fast",
            "cost": Decimal("0.001"),
        },
    )

    assert cost_result.decision.optimized is True

    print()
    print("COST OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 2: SPEED / LATENCY PRIORITY
    # ------------------------------------------------------------------

    speed_result = run_test(
        "TEST 2 - AUTOMATIC SPEED OPTIMIZATION",
        OptimizationRequest(
            objective=OptimizationObjective.LATENCY,
            weights=OptimizationWeights(
                cost=Decimal("0.05"),
                latency=Decimal("0.90"),
                quality=Decimal("0.05"),
            ),
            candidates=CANDIDATES,
            request_id="auto-speed-001",
            metadata={"scenario": "speed_priority"},
        ),
        {
            "model": "mlm-fast",
            "latency": Decimal("80"),
        },
    )

    print()
    print("SPEED OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 3: QUALITY PRIORITY
    # ------------------------------------------------------------------

    quality_result = run_test(
        "TEST 3 - AUTOMATIC QUALITY OPTIMIZATION",
        OptimizationRequest(
            model="slm-fast",
            provider="provider-a",
            objective=OptimizationObjective.QUALITY,
            weights=OptimizationWeights(
                cost=Decimal("0.02"),
                latency=Decimal("0.03"),
                quality=Decimal("0.95"),
            ),
            candidates=CANDIDATES,
            request_id="auto-quality-001",
            metadata={"scenario": "quality_priority"},
        ),
        {
            "model": "llm-premium",
            "quality": Decimal("0.97"),
        },
    )

    print()
    print("QUALITY OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 4: BALANCED COST + SPEED + QUALITY
    # ------------------------------------------------------------------

    balanced_result = run_test(
        "TEST 4 - AUTOMATIC BALANCED OPTIMIZATION",
        OptimizationRequest(
            objective=OptimizationObjective.BALANCED,
            weights=OptimizationWeights(
                cost=Decimal("0.33"),
                latency=Decimal("0.33"),
                quality=Decimal("0.34"),
            ),
            candidates=CANDIDATES,
            request_id="auto-balanced-001",
            metadata={"scenario": "balanced"},
        ),
        {},
    )

    assert balanced_result.decision.score is not None

    print()
    print("BALANCED OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 5: CONSTRAINT-AWARE OPTIMIZATION
    # ------------------------------------------------------------------

    constraint_result = run_test(
        "TEST 5 - AUTOMATIC CONSTRAINT OPTIMIZATION",
        OptimizationRequest(
            model="llm-premium",
            provider="provider-c",
            objective=OptimizationObjective.BALANCED,
            weights=OptimizationWeights(
                cost=Decimal("0.40"),
                latency=Decimal("0.30"),
                quality=Decimal("0.30"),
            ),
            constraints=OptimizationConstraints(
                max_cost=Decimal("0.006"),
                max_latency_ms=Decimal("200"),
                min_quality_score=Decimal("0.80"),
            ),
            candidates=CANDIDATES,
            request_id="auto-constraints-001",
            metadata={"scenario": "constraints"},
        ),
        {
            "max_cost": Decimal("0.006"),
            "max_latency": Decimal("200"),
            "min_quality": Decimal("0.80"),
        },
    )

    assert constraint_result.candidates_feasible == 2

    print()
    print("CONSTRAINT OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 6: PROVIDER SWITCHING
    # ------------------------------------------------------------------

    provider_candidates = [
        OptimizationCandidate(
            model="same-model",
            provider="slow-provider",
            estimated_cost=Decimal("0.005"),
            estimated_latency_ms=Decimal("300"),
            quality_score=Decimal("0.90"),
        ),
        OptimizationCandidate(
            model="same-model",
            provider="fast-provider",
            estimated_cost=Decimal("0.005"),
            estimated_latency_ms=Decimal("100"),
            quality_score=Decimal("0.90"),
        ),
    ]

    provider_result = run_test(
        "TEST 6 - AUTOMATIC PROVIDER OPTIMIZATION",
        OptimizationRequest(
            model="same-model",
            provider="slow-provider",
            objective=OptimizationObjective.LATENCY,
            weights=OptimizationWeights(
                cost=Decimal("0.05"),
                latency=Decimal("0.90"),
                quality=Decimal("0.05"),
            ),
            candidates=provider_candidates,
            request_id="auto-provider-001",
            metadata={"scenario": "provider_switch"},
        ),
        {
            "provider": "fast-provider",
            "latency": Decimal("100"),
        },
    )

    assert provider_result.decision.action.value == "switch_provider"

    print()
    print("PROVIDER OPTIMIZATION: PASS")

    # ------------------------------------------------------------------
    # FINAL RESULT
    # ------------------------------------------------------------------

    print()
    print("=" * 100)
    print("REAL AUTOMATIC OPTIMIZATION: PASS")
    print("=" * 100)
    print(
        "ModelNow automatically optimized candidate routes across "
        "cost, speed, quality, balanced objectives, constraints, "
        "and provider selection."
    )
    print("=" * 100)


if __name__ == "__main__":
    main()
