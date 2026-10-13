from decimal import Decimal

from ai.optimization_engine.engine import OptimizationEngine
from ai.optimization_engine.models import (
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationWeights,
)


def candidates():
    return [
        OptimizationCandidate(
            model="slm-fast",
            provider="provider-a",
            estimated_cost=Decimal("0.001"),
            estimated_latency_ms=Decimal("100"),
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
            estimated_latency_ms=Decimal("80"),
            quality_score=Decimal("0.84"),
        ),
    ]


def check(name, condition):
    status = "PASS" if condition else "FAIL"
    print(f"{name}: {status}")
    assert condition


def main():
    print("=" * 100)
    print("MODELNOW OPTIMIZATION ENGINE TEST")
    print("=" * 100)

    engine = OptimizationEngine()
    pool = candidates()

    # 1. OBJECTIVE SELECTION
    request = OptimizationRequest(
        objective=OptimizationObjective.COST,
        weights=OptimizationWeights(
            cost=Decimal("0.80"),
            latency=Decimal("0.15"),
            quality=Decimal("0.05"),
        ),
        candidates=pool,
        request_id="engine-test-cost",
    )

    result = engine.optimize(request)

    check(
        "OBJECTIVE SELECTION",
        result.decision.objective == OptimizationObjective.COST,
    )

    # 2. COST OPTIMIZATION
    check(
        "COST OPTIMIZATION",
        result.optimized_cost == Decimal("0.001"),
    )

    # 3. LATENCY OPTIMIZATION
    request = OptimizationRequest(
        objective=OptimizationObjective.LATENCY,
        weights=OptimizationWeights(
            cost=Decimal("0.05"),
            latency=Decimal("0.90"),
            quality=Decimal("0.05"),
        ),
        candidates=pool,
        request_id="engine-test-latency",
    )

    result = engine.optimize(request)

    check(
        "LATENCY OPTIMIZATION",
        result.optimized_latency_ms == Decimal("80"),
    )

    # 4. QUALITY OPTIMIZATION
    request = OptimizationRequest(
        objective=OptimizationObjective.QUALITY,
        weights=OptimizationWeights(
            cost=Decimal("0.05"),
            latency=Decimal("0.05"),
            quality=Decimal("0.90"),
        ),
        candidates=pool,
        request_id="engine-test-quality",
    )

    result = engine.optimize(request)

    check(
        "QUALITY OPTIMIZATION",
        result.optimized_quality == Decimal("0.97"),
    )

    # 5. BALANCED OPTIMIZATION
    request = OptimizationRequest(
        objective=OptimizationObjective.BALANCED,
        weights=OptimizationWeights(
            cost=Decimal("0.33"),
            latency=Decimal("0.33"),
            quality=Decimal("0.34"),
        ),
        candidates=pool,
        request_id="engine-test-balanced",
    )

    result = engine.optimize(request)

    check(
        "BALANCED OPTIMIZATION",
        result.decision.score is not None,
    )

    # 6. CONSTRAINT HANDLING
    request = OptimizationRequest(
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
        candidates=pool,
        request_id="engine-test-constraints",
    )

    result = engine.optimize(request)

    check(
        "CONSTRAINT HANDLING",
        result.candidates_feasible == 2,
    )

    check(
        "CONSTRAINT VALIDATION",
        result.optimized_cost <= Decimal("0.006")
        and result.optimized_latency_ms <= Decimal("200")
        and result.optimized_quality >= Decimal("0.80"),
    )

    # 7. MODEL SWITCHING
    request = OptimizationRequest(
        model="llm-premium",
        provider="provider-c",
        objective=OptimizationObjective.COST,
        weights=OptimizationWeights(
            cost=Decimal("0.90"),
            latency=Decimal("0.05"),
            quality=Decimal("0.05"),
        ),
        candidates=pool,
        request_id="engine-test-model-switch",
    )

    result = engine.optimize(request)

    check(
        "MODEL OPTIMIZATION",
        result.decision.selected_model == "slm-fast",
    )

    check(
        "MODEL SWITCH ACTION",
        result.decision.action.value == "switch_model",
    )

    # 8. EVALUATE SINGLE CANDIDATE
    score = engine.evaluate(
        OptimizationRequest(
            objective=OptimizationObjective.BALANCED,
            candidates=pool,
        ),
        pool[0],
    )

    check(
        "CANDIDATE EVALUATION",
        score.model == "slm-fast"
        and score.provider == "provider-a"
        and score.total_score >= Decimal("0"),
    )

    # 9. RESULT INTEGRITY
    check(
        "RESULT INTEGRITY",
        result.candidates_evaluated == 4
        and result.candidates_feasible == 4,
    )

    print("=" * 100)
    print("OPTIMIZATION ENGINE: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
