from __future__ import annotations

import math
import tempfile
from pathlib import Path

from ai.routing_engine.learning_router.feedback import RoutingFeedback
from ai.routing_engine.model_memory.memory import MemoryRecord
from ai.routing_engine.model_memory.sqlite_store import (
    SQLiteFeedbackStore,
    SQLiteModelMemory,
)


def run_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="modelnow_sqlite_test_") as temp_dir:
        database_path = str(Path(temp_dir) / "routing_test.db")

        # 1. Model observations survive reopening the database.
        observation = MemoryRecord(
            request_id="persist-request-1",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            quality_score=0.91,
            latency_ms=125.5,
            cost=0.002,
            success=True,
            task_type="code",
            metadata={"source": "sqlite-test", "attempt": 1},
            created_at=1_800_000_001.25,
        )

        memory = SQLiteModelMemory(database_path=database_path)
        memory.add(observation)
        assert memory.count() == 1
        del memory

        reopened_memory = SQLiteModelMemory(database_path=database_path)
        restored = reopened_memory.get("persist-request-1")

        assert restored is not None
        assert restored.model_id == "test-slm"
        assert restored.provider == "test-provider"
        assert restored.tier == "SLM"
        assert math.isclose(restored.quality_score, 0.91)
        assert math.isclose(restored.latency_ms, 125.5)
        assert math.isclose(restored.cost, 0.002)
        assert restored.task_type == "code"
        assert restored.metadata == {"source": "sqlite-test", "attempt": 1}
        assert restored.created_at == 1_800_000_001.25
        assert reopened_memory.model_records("test-slm")[0].request_id == (
            "persist-request-1"
        )
        print("MODEL MEMORY PERSISTENCE: PASS")

        # 2. Feedback survives reopening, including task_type and reward.
        feedback = RoutingFeedback(
            request_id="feedback-request-1",
            model_id="test-mlm",
            provider="test-provider",
            tier="MLM",
            task_type="reasoning",
            quality_score=0.95,
            latency_ms=210.0,
            cost=0.01,
            success=True,
            reward=0.8,
            metadata={"source": "user-feedback", "rating": 5},
            created_at=1_800_000_002.5,
        )

        feedback_store = SQLiteFeedbackStore(database_path=database_path)
        feedback_store.add(feedback)
        assert feedback_store.count() == 1
        del feedback_store

        reopened_feedback = SQLiteFeedbackStore(database_path=database_path)
        restored_feedback = reopened_feedback.get("feedback-request-1")

        assert restored_feedback is not None
        assert restored_feedback.model_id == "test-mlm"
        assert restored_feedback.task_type == "reasoning"
        assert restored_feedback.reward == 0.8
        assert restored_feedback.metadata == {
            "source": "user-feedback",
            "rating": 5,
        }
        assert restored_feedback.created_at == 1_800_000_002.5
        assert reopened_feedback.for_model("test-mlm")[0].request_id == (
            "feedback-request-1"
        )
        assert reopened_feedback.for_task("reasoning")[0].request_id == (
            "feedback-request-1"
        )
        assert reopened_feedback.recent(1)[0].request_id == (
            "feedback-request-1"
        )
        print("FEEDBACK PERSISTENCE: PASS")
        print("FEEDBACK QUERY COMPATIBILITY: PASS")

        # 3. Batch validation must fail before inserting any batch rows.
        batch_memory = SQLiteModelMemory(database_path=database_path)
        valid_record = MemoryRecord(
            request_id="batch-valid",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            quality_score=0.8,
            latency_ms=100,
            cost=0.001,
            metadata={"valid": True},
        )
        invalid_record = MemoryRecord(
            request_id="batch-invalid",
            model_id="test-slm",
            provider="test-provider",
            tier="SLM",
            quality_score=0.8,
            latency_ms=100,
            cost=0.001,
            metadata={"invalid": object()},
        )

        try:
            batch_memory.add_many([valid_record, invalid_record])
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid metadata should be rejected")

        reopened_batch_memory = SQLiteModelMemory(
            database_path=database_path
        )
        assert reopened_batch_memory.get("batch-valid") is None
        assert reopened_batch_memory.get("batch-invalid") is None
        print("BATCH VALIDATION BEFORE INSERT: PASS")

        # 4. Clear operations must persist.
        deleted_observations = reopened_memory.clear()
        assert deleted_observations >= 1
        assert SQLiteModelMemory(database_path=database_path).count() == 0
        print("MODEL MEMORY CLEAR PERSISTENCE: PASS")

        deleted_feedback = reopened_feedback.clear()
        assert deleted_feedback >= 1
        assert SQLiteFeedbackStore(database_path=database_path).count() == 0
        print("FEEDBACK CLEAR PERSISTENCE: PASS")

    print("=" * 58)
    print("MODELNOW SQLITE STORE TEST: PASS")
    print("=" * 58)


if __name__ == "__main__":
    run_tests()
