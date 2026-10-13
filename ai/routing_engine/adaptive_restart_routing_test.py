from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path

from ai.memory.storage.database import MemoryDatabase
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.learning_router.feedback import RoutingFeedback
from ai.routing_engine.model_memory.memory import MemoryRecord
from ai.routing_engine.model_memory.sqlite_store import (
    SQLiteFeedbackStore,
    SQLiteModelMemory,
)
from ai.routing_engine.models import RoutingRequest


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
        ModelRecord(
            provider="restart-test",
            model_id="restart-slm",
            display_name="Restart Test SLM",
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
            provider="restart-test",
            model_id="restart-mlm",
            display_name="Restart Test MLM",
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


async def main() -> None:
    with tempfile.TemporaryDirectory(
        prefix="modelnow_adaptive_restart_"
    ) as temp_dir:
        database_path = str(Path(temp_dir) / "adaptive_restart.db")

        # Session 1: record actual observations and feedback.
        first_database = MemoryDatabase(database_path)
        first_memory = SQLiteModelMemory(database=first_database)
        first_feedback = SQLiteFeedbackStore(database=first_database)

        first_memory.add(
            MemoryRecord(
                request_id="restart-slm-001",
                model_id="restart-slm",
                provider="restart-test",
                tier="slm",
                quality_score=0.98,
                latency_ms=40.0,
                cost=0.00001,
                success=True,
                task_type="general",
            )
        )

        first_feedback.add(
            RoutingFeedback(
                request_id="restart-slm-001",
                model_id="restart-slm",
                provider="restart-test",
                tier="slm",
                task_type="general",
                quality_score=0.98,
                latency_ms=40.0,
                cost=0.00001,
                success=True,
                reward=0.98,
            )
        )

        first_memory.add(
            MemoryRecord(
                request_id="restart-mlm-001",
                model_id="restart-mlm",
                provider="restart-test",
                tier="mlm",
                quality_score=0.70,
                latency_ms=300.0,
                cost=0.02,
                success=True,
                task_type="general",
            )
        )

        first_feedback.add(
            RoutingFeedback(
                request_id="restart-mlm-001",
                model_id="restart-mlm",
                provider="restart-test",
                tier="mlm",
                task_type="general",
                quality_score=0.70,
                latency_ms=300.0,
                cost=0.02,
                success=True,
                reward=0.40,
            )
        )

        first_database.close()
        print("INITIAL HISTORY SAVED: PASS")

        # Session 2: construct fresh stores and a fresh routing engine.
        second_database = MemoryDatabase(database_path)
        restored_memory = SQLiteModelMemory(database=second_database)
        restored_feedback = SQLiteFeedbackStore(database=second_database)

        assert restored_memory.count() == 2
        assert restored_feedback.count() == 2

        engine = RoutingEngine(
            registry=build_registry(),
            model_memory=restored_memory,
            feedback_store=restored_feedback,
        )

        request = RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "Explain a Python function simply.",
                }
            ],
            objective=RoutingObjective.QUALITY,
            required_capabilities=("code",),
            metadata={"task_type": "general"},
        )

        decision = await engine.route(request)
        candidates = await engine.get_candidates(request)

        assert decision.status.value == "selected"
        assert decision.metadata["adaptive_applied"] is True

        scores = decision.metadata["adaptive_scores"]
        assert scores["restart-slm"]["adaptive_applied"] is True
        assert scores["restart-mlm"]["adaptive_applied"] is True

        slm_signal = engine.adaptive_router.signal(
            next(
                candidate
                for candidate in candidates
                if candidate.model_id == "restart-slm"
            ),
            task_type="general",
        )

        assert slm_signal is not None
        assert slm_signal.samples == 1
        assert slm_signal.reward == 0.98

        mlm_signal = engine.adaptive_router.signal(
            next(
                candidate
                for candidate in candidates
                if candidate.model_id == "restart-mlm"
            ),
            task_type="general",
        )

        assert mlm_signal is not None
        assert mlm_signal.samples == 1
        assert mlm_signal.reward == 0.40

        print("RESTORED MEMORY CREATES ADAPTIVE SIGNALS: PASS")
        print("RESTORED FEEDBACK REWARDS: PASS")
        print("ADAPTIVE ROUTER CONSUMES RESTORED HISTORY: PASS")
        print("SELECTED MODEL:", decision.model_id)
        print("SELECTED TIER:", decision.tier)
        print("ADAPTIVE SCORES:", scores)

        second_database.close()

    print("=" * 60)
    print("MODELNOW ADAPTIVE RESTART ROUTING TEST: PASS")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

