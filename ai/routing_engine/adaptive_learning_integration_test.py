from __future__ import annotations

import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.learning_router.feedback import (
    RoutingFeedback,
)
from ai.routing_engine.model_memory.memory import MemoryRecord
from ai.routing_engine.models import RoutingRequest
from ai.routing_engine.constants import RoutingObjective


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
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
        )
    )

    registry.register(
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
                chat=True,
                code=True,
                reasoning=True,
            ),
            latency_ms=250.0,
            quality_score=0.92,
        )
    )

    return registry


def seed_history(engine: RoutingEngine) -> None:
    engine.model_memory.add(
        MemoryRecord(
            request_id="learning-general-1",
            model_id="learning-slm",
            provider="test-provider",
            tier="slm",
            quality_score=0.95,
            latency_ms=40.0,
            cost=0.00001,
            success=True,
            task_type="general",
        )
    )

    engine.feedback_store.add(
        RoutingFeedback(
            request_id="learning-general-1",
            model_id="learning-slm",
            provider="test-provider",
            tier="slm",
            task_type="general",
            quality_score=0.95,
            latency_ms=40.0,
            cost=0.00001,
            success=True,
            reward=0.95,
        )
    )


async def main() -> None:
    from ai.routing_engine.exceptions import NoRouteAvailableError

    engine = RoutingEngine(registry=build_registry())
    seed_history(engine)

    general_request = RoutingRequest(
        messages=[
            {"role": "user", "content": "Explain a Python function."}
        ],
        preferred_tier="slm",
        required_capabilities=("code",),
        metadata={"task_type": "general"},
    )

    general_decision = await engine.route(general_request)

    assert general_decision.status.value == "selected"
    assert general_decision.metadata["task_type"] == "general"
    assert general_decision.metadata["adaptive_applied"] is True

    general_scores = general_decision.metadata["adaptive_scores"]
    assert general_scores["learning-slm"]["adaptive_applied"] is True
    assert general_scores["learning-slm"]["confidence"] > 0.0

    print("RECORDED HISTORY -> ADAPTIVE SIGNAL: PASS")
    print("TASK TYPE PROPAGATION: PASS")
    print("ADAPTIVE SELECTOR INTEGRATION: PASS")

    coding_request = RoutingRequest(
        messages=[
            {"role": "user", "content": "Explain a Python function."}
        ],
        preferred_tier="slm",
        required_capabilities=("code",),
        metadata={"task_type": "coding"},
    )

    coding_decision = await engine.route(coding_request)

    assert coding_decision.status.value == "selected"
    assert coding_decision.metadata["task_type"] == "coding"

    coding_scores = coding_decision.metadata["adaptive_scores"]
    assert coding_scores["learning-slm"]["adaptive_applied"] is False

    print("TASK-SPECIFIC HISTORY ISOLATION: PASS")

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
        await engine.route(constrained_request)
    except NoRouteAvailableError:
        print("CONFLICTING HARD CONSTRAINTS REJECTED: PASS")
    else:
        raise AssertionError(
            "Expected no route when SLM tier and minimum quality conflict"
        )

    quality_request = RoutingRequest(
        messages=[
            {"role": "user", "content": "Explain a Python function."}
        ],
        objective=RoutingObjective.QUALITY,
        required_capabilities=("code",),
        min_quality=0.90,
        metadata={"task_type": "general"},
    )

    quality_decision = await engine.route(quality_request)

    assert quality_decision.model_id == "learning-mlm"
    assert quality_decision.candidates_considered == 1

    print("QUALITY CONSTRAINT SELECTS ELIGIBLE MLM: PASS")
    print("ADAPTIVE LEARNING INTEGRATION: PASS")


if __name__ == "__main__":
    asyncio.run(main())



