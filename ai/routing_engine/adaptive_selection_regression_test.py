from __future__ import annotations

import asyncio

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.exceptions import NoRouteAvailableError
from ai.routing_engine.models import RoutingRequest

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.learning_router.feedback import RoutingFeedback
from ai.routing_engine.model_memory.memory import MemoryRecord



def build_registry() -> ModelRegistryEngine:
    """Build isolated test candidates for all three ModelNow tiers."""
    registry = ModelRegistryEngine()

    models = [
        ModelRecord(
            provider="test-provider",
            model_id="learning-slm",
            display_name="Learning SLM",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.10,
                output_per_1m_tokens=0.20,
            ),
            capabilities=ModelCapabilities(chat=True, code=True),
            latency_ms=100.0,
            quality_score=0.80,
        ),
        ModelRecord(
            provider="test-provider",
            model_id="learning-mlm",
            display_name="Learning MLM",
            tier=ModelTier.MLM,
            context_window=8192,
            max_output_tokens=2048,
            pricing=ModelPricing(
                input_per_1m_tokens=0.50,
                output_per_1m_tokens=1.00,
            ),
            capabilities=ModelCapabilities(
                chat=True, code=True, reasoning=True
            ),
            latency_ms=250.0,
            quality_score=0.92,
        ),
        ModelRecord(
            provider="test-provider",
            model_id="learning-llm",
            display_name="Learning LLM",
            tier=ModelTier.LLM,
            context_window=32768,
            max_output_tokens=8192,
            pricing=ModelPricing(
                input_per_1m_tokens=3.00,
                output_per_1m_tokens=6.00,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                reasoning=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=500.0,
            quality_score=0.98,
        ),
    ]

    for model in models:
        registry.register(model)

    return registry


def record_history(
    engine: RoutingEngine,
    model_id: str,
    request_id: str,
    quality: float,
    latency_ms: float,
    cost: float,
    reward: float,
) -> None:
    engine.model_memory.add(
        MemoryRecord(
            request_id=request_id,
            model_id=model_id,
            provider="test-provider",
            tier={
                "learning-slm": "slm",
                "learning-mlm": "mlm",
                "learning-llm": "llm",
            }[model_id],
            quality_score=quality,
            latency_ms=latency_ms,
            cost=cost,
            success=True,
            task_type="general",
        )
    )

    engine.feedback_store.add(
        RoutingFeedback(
            request_id=request_id,
            model_id=model_id,
            provider="test-provider",
            tier={
                "learning-slm": "slm",
                "learning-mlm": "mlm",
                "learning-llm": "llm",
            }[model_id],
            task_type="general",
            quality_score=quality,
            latency_ms=latency_ms,
            cost=cost,
            success=True,
            reward=reward,
        )
    )


def request() -> RoutingRequest:
    return RoutingRequest(
        messages=[
            {"role": "user", "content": "Explain a Python function."}
        ],
        objective=RoutingObjective.QUALITY,
        required_capabilities=("code",),
        metadata={"task_type": "general"},
    )


async def main() -> None:
    # Baseline: no historical observations.
    baseline_engine = RoutingEngine(registry=build_registry())
    baseline = await baseline_engine.route(request())

    assert baseline.status.value == "selected"
    assert baseline.model_id == "learning-llm"
    assert baseline.metadata["adaptive_applied"] is False

    assert baseline.candidates_considered == 3
    print("THREE-TIER REGISTRY (SLM, MLM, LLM): PASS")
    print("BASELINE AUTOMATIC QUALITY ROUTE: PASS")
    print("BASELINE WITHOUT HISTORY: PASS")

    # Seed enough SLM history to raise confidence to 1.0.
    adaptive_engine = RoutingEngine(registry=build_registry())

    for index in range(10):
        record_history(
            adaptive_engine,
            model_id="learning-slm",
            request_id=f"slm-history-{index}",
            quality=1.0,
            latency_ms=20.0,
            cost=0.000001,
            reward=1.0,
        )

    adaptive = await adaptive_engine.route(request())

    assert adaptive.status.value == "selected"
    assert adaptive.metadata["adaptive_applied"] is True

    slm_scores = adaptive.metadata["adaptive_scores"]
    assert slm_scores["learning-slm"]["confidence"] == 1.0
    assert slm_scores["learning-slm"]["adaptive_applied"] is True

    # Historical SLM quality is excellent, but the request has no hard
    # tier or minimum-quality restriction. Confirm the actual selected
    # model matches the computed final candidate scores.
    final_scores = adaptive.metadata["candidate_scores"]
    expected_winner = max(
        final_scores,
        key=lambda model_id: (
            final_scores[model_id],
            model_id,
        ),
    )
    assert adaptive.model_id == expected_winner

    print("HISTORICAL SIGNALS AFFECT ADAPTIVE SCORES: PASS")
    print("SELECTED MODEL MATCHES FINAL SCORES: PASS")
    print("BASELINE WINNER:", baseline.model_id)
    print("ADAPTIVE WINNER:", adaptive.model_id)
    print("BASELINE SCORES:", baseline.metadata["candidate_scores"])
    print("ADAPTIVE SCORES:", adaptive.metadata["candidate_scores"])

    # Hard constraints must remain authoritative even with strong SLM history.
    constrained_engine = RoutingEngine(registry=build_registry())

    for index in range(10):
        record_history(
            constrained_engine,
            model_id="learning-slm",
            request_id=f"constrained-slm-history-{index}",
            quality=1.0,
            latency_ms=20.0,
            cost=0.000001,
            reward=1.0,
        )

    constrained_request = RoutingRequest(
        messages=[
            {"role": "user", "content": "Explain a Python function."}
        ],
        preferred_tier="slm",
        required_capabilities=("code",),
        min_quality=0.90,
        metadata={"task_type": "general"},
    )

    try:
        await constrained_engine.route(constrained_request)
    except NoRouteAvailableError:
        print("HARD CONSTRAINTS OVERRIDE ADAPTIVE PREFERENCE: PASS")
    else:
        raise AssertionError(
            "Adaptive history must not override incompatible hard constraints"
        )

    print("THREE-TIER ADAPTIVE SELECTION REGRESSION: PASS")


if __name__ == "__main__":
    asyncio.run(main())
