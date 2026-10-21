from decimal import Decimal

from ai.optimization_engine.engine import OptimizationEngine
from ai.optimization_engine.models import (
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationWeights,
)


def print_result(title, result):
    print()
    print("=" * 100)
    print(title)
    print("=" * 100)

    print(f"Action:              {result.decision.action.value}")
    print(f"Selected model:      {result.decision.selected_model}")
    print(f"Selected provider:   {result.decision.selected_provider}")
    print(f"Optimized:           {result.decision.optimized}")
    print(f"Objective:           {result.decision.objective.value}")
    print(f"Candidates evaluated:{result.candidates_evaluated}")
    print(f"Candidates feasible: {result.candidates_feasible}")

    print()
    print("Baseline")
    print(f"  Model:             {result.baseline_model}")
    print(f"  Provider:          {result.baseline_provider}")
    print(f"  Cost:              {result.baseline_cost}")
    print(f"  Latency:           {result.baseline_latency_ms} ms")
    print(f"  Quality:           {result.baseline_quality}")

    print()
    print("Optimized")
    print(f"  Cost:              {result.optimized_cost}")
    print(f"  Latency:           {result.optimized_latency_ms} ms")
    print(f"  Quality:           {result.optimized_quality}")

    print()
    print("Reason:")
    print(f"  {result.decision.reason}")

    if result.decision.score:
        score = result.decision.score
        print()
        print("Normalized Score")
        print(f"  Cost score:        {score.cost_score}")
        print(f"  Latency score:     {score.latency_score}")
        print(f"  Quality score:     {score.quality_score}")
        print(f"  Total score:       {score.total_score}")


def main():
    engine = OptimizationEngine()

    candidates = [
        OptimizationCandidate(
            model="slm-fast",
            provider="provider-a",
            estimated_cost=Decimal("0.001"),
            estimated_latency_ms=Decimal("120"),
            quality_score=Decimal("0.72"),
        ),
        OptimizationCandidate(
            model="mlm-balanced",
            provider="provider-b",
            estimated_cost=Decimal("0.004"),
            estimated_latency_ms=Decimal("180"),
            quality_score=Decimal("0.88"),
        ),
        OptimizationCandidate(
            model="llm-premium",
            provider="provider-c",
            estimated_cost=Decimal("0.020"),
            estimated_latency_ms=Decimal("450"),
            quality_score=Decimal("0.97"),
        ),
        OptimizationCandidate(
            model="mlm-fast",
            provider="provider-d",
            estimated_cost=Decimal("0.006"),
            estimated_latency_ms=Decimal("100"),
            quality_score=Decimal("0.84"),
        ),
    ]

    # TEST 1: BALANCED OPTIMIZATION

    balanced_request = OptimizationRequest(
        model="llm-premium",
        provider="provider-c",
        objective=OptimizationObjective.BALANCED,
        weights=OptimizationWeights(
            cost=Decimal("0.30"),
            latency=Decimal("0.30"),
            quality=Decimal("0.40"),
        ),
        candidates=candidates,
        request_id="real-balanced-test-001",
        metadata={
            "test": "real_optimization_integration",
            "scenario": "balanced",
        },
    )

    balanced_result = engine.optimize(balanced_request)

    print_result(
        "TEST 1 - BALANCED OPTIMIZATION",
        balanced_result,
    )

    assert balanced_result.candidates_evaluated == 4
    assert balanced_result.candidates_feasible == 4
    assert balanced_result.decision.selected_model is not None
    assert balanced_result.decision.score is not None

    # TEST 2: COST-FIRST OPTIMIZATION

    cost_request = OptimizationRequest(
        model="llm-premium",
        provider="provider-c",
        objective=OptimizationObjective.COST,
        weights=OptimizationWeights(
            cost=Decimal("0.80"),
            latency=Decimal("0.15"),
            quality=Decimal("0.05"),
        ),
        candidates=candidates,
        request_id="real-cost-test-001",
        metadata={
            "test": "real_optimization_integration",
            "scenario": "cost",
        },
    )

    cost_result = engine.optimize(cost_request)

    print_result(
        "TEST 2 - COST-FIRST OPTIMIZATION",
        cost_result,
    )

    assert cost_result.optimized_cost <= Decimal("0.006")

    # TEST 3: LATENCY-FIRST OPTIMIZATION

    latency_request = OptimizationRequest(
        model="llm-premium",
        provider="provider-c",
        objective=OptimizationObjective.LATENCY,
        weights=OptimizationWeights(
            cost=Decimal("0.10"),
            latency=Decimal("0.80"),
            quality=Decimal("0.10"),
        ),
        candidates=candidates,
        request_id="real-latency-test-001",
        metadata={
            "test": "real_optimization_integration",
            "scenario": "latency",
        },
    )

    latency_result = engine.optimize(latency_request)

    print_result(
        "TEST 3 - LATENCY-FIRST OPTIMIZATION",
        latency_result,
    )

    assert latency_result.optimized_latency_ms == Decimal("100")

    # TEST 4: QUALITY-FIRST OPTIMIZATION

    quality_request = OptimizationRequest(
        model="slm-fast",
        provider="provider-a",
        objective=OptimizationObjective.QUALITY,
        weights=OptimizationWeights(
            cost=Decimal("0.05"),
            latency=Decimal("0.05"),
            quality=Decimal("0.90"),
        ),
        candidates=candidates,
        request_id="real-quality-test-001",
        metadata={
            "test": "real_optimization_integration",
            "scenario": "quality",
        },
    )

    quality_result = engine.optimize(quality_request)

    print_result(
        "TEST 4 - QUALITY-FIRST OPTIMIZATION",
        quality_result,
    )

    assert quality_result.optimized_quality == Decimal("0.97")
    assert quality_result.decision.selected_model == "llm-premium"

    # TEST 5: CONSTRAINT-AWARE OPTIMIZATION

    constrained_request = OptimizationRequest(
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
        candidates=candidates,
        request_id="real-constraint-test-001",
        metadata={
            "test": "real_optimization_integration",
            "scenario": "constraints",
        },
    )

    constrained_result = engine.optimize(constrained_request)

    print_result(
        "TEST 5 - CONSTRAINT-AWARE OPTIMIZATION",
        constrained_result,
    )

    assert constrained_result.candidates_evaluated == 4
    assert constrained_result.candidates_feasible == 2

    assert constrained_result.optimized_cost <= Decimal("0.006")
    assert constrained_result.optimized_latency_ms <= Decimal("200")
    assert constrained_result.optimized_quality >= Decimal("0.80")

    print()
    print("=" * 100)
    print("MODELNOW OPTIMIZATION ENGINE REAL INTEGRATION TEST")
    print("=" * 100)
    print("PASS - Optimization Engine successfully evaluated real")
    print("      model/provider candidates across cost, latency,")
    print("      quality, balanced objectives, and constraints.")
    print("=" * 100)


if __name__ == "__main__":
    main()
