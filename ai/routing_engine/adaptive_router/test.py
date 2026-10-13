import math

from ai.routing_engine.adaptive_router import AdaptiveRoutingEngine
from ai.routing_engine.learning_router.feedback import FeedbackStore, RoutingFeedback
from ai.routing_engine.model_memory.memory import MemoryRecord, ModelMemory
from ai.routing_engine.models import ModelCandidate


def candidate(model_id: str) -> ModelCandidate:
    return ModelCandidate(
        model_id=model_id,
        provider="test-provider",
        tier="SLM",
        quality=0.80,
        input_cost=0.10,
        output_cost=0.20,
        estimated_latency_ms=100.0,
    )


def main() -> None:
    memory = ModelMemory()
    feedback = FeedbackStore()

    memory.add(
        MemoryRecord(
            request_id="req-1",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            quality_score=0.80,
            latency_ms=100.0,
            cost=0.30,
            success=True,
            task_type="general",
        )
    )

    memory.add(
        MemoryRecord(
            request_id="req-2",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            quality_score=0.90,
            latency_ms=80.0,
            cost=0.20,
            success=True,
            task_type="general",
        )
    )

    feedback.add(
        RoutingFeedback(
            request_id="req-1",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            task_type="general",
            quality_score=0.80,
            latency_ms=100.0,
            cost=0.30,
            success=True,
            reward=0.70,
        )
    )

    feedback.add(
        RoutingFeedback(
            request_id="req-2",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            task_type="general",
            quality_score=0.90,
            latency_ms=80.0,
            cost=0.20,
            success=True,
            reward=0.90,
        )
    )

    engine = AdaptiveRoutingEngine(
        model_memory=memory,
        feedback_store=feedback,
        min_samples=1,
    )

    signal = engine.signal(
        candidate("test-slm"),
        task_type="general",
    )

    assert signal is not None
    assert signal.model_id == "test-slm"
    assert signal.samples == 2
    assert math.isclose(signal.quality_score, 0.85, rel_tol=1e-9)
    assert math.isclose(signal.latency_ms, 90.0, rel_tol=1e-9)
    assert math.isclose(signal.cost, 0.25, rel_tol=1e-9)
    assert signal.success_rate == 1.0
    assert math.isclose(signal.reward, 0.80, rel_tol=1e-9)
    assert signal.confidence == 0.2
    assert signal.metadata["memory_samples"] == 2
    assert signal.metadata["feedback_samples"] == 2
    assert signal.metadata["task_type"] == "general"

    signals = engine.signals(
        [candidate("test-slm")],
        task_type="general",
    )

    assert "test-slm" in signals
    assert signals["test-slm"].samples == 2

    print("ADAPTIVE SIGNAL: PASS")
    print(f"SAMPLES: {signal.samples}")
    print(f"QUALITY: {signal.quality_score}")
    print(f"LATENCY: {signal.latency_ms}")
    print(f"COST: {signal.cost}")
    print(f"SUCCESS RATE: {signal.success_rate}")
    print(f"REWARD: {signal.reward}")
    print(f"CONFIDENCE: {signal.confidence}")
    print("ADAPTIVE SIGNALS MAP: PASS")


if __name__ == "__main__":
    main()
