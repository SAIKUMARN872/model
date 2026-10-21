from __future__ import annotations

import tempfile
from pathlib import Path

from ai.memory.storage.database import MemoryDatabase
from ai.routing_engine.learning_router.feedback import RoutingFeedback
from ai.routing_engine.model_memory.memory import MemoryRecord
from ai.routing_engine.model_memory.sqlite_store import (
    SQLiteFeedbackStore,
    SQLiteModelMemory,
)


def main() -> None:
    with tempfile.TemporaryDirectory(
        prefix="modelnow_runtime_restart_"
    ) as temp_dir:
        database_path = str(Path(temp_dir) / "routing_restart.db")

        # First runtime session: write both observation and feedback.
        database = MemoryDatabase(database_path)

        memory = SQLiteModelMemory(database=database)
        feedback = SQLiteFeedbackStore(database=database)

        assert memory.database is feedback.database

        memory.add(
            MemoryRecord(
                request_id="restart-observation-001",
                model_id="restart-slm",
                provider="test-provider",
                tier="SLM",
                quality_score=0.93,
                latency_ms=80.0,
                cost=0.001,
                success=True,
                task_type="summarization",
                metadata={"session": 1},
                created_at=1_800_000_100.0,
            )
        )

        feedback.add(
            RoutingFeedback(
                request_id="restart-feedback-001",
                model_id="restart-slm",
                provider="test-provider",
                tier="SLM",
                task_type="summarization",
                quality_score=0.93,
                latency_ms=80.0,
                cost=0.001,
                success=True,
                reward=0.9,
                metadata={"source": "restart-test"},
                created_at=1_800_000_101.0,
            )
        )

        assert memory.count() == 1
        assert feedback.count() == 1

        database.close()
        print("FIRST SESSION DATABASE CLOSED: PASS")

        # Second runtime session: reopen the same SQLite file.
        reopened_database = MemoryDatabase(database_path)

        reopened_memory = SQLiteModelMemory(
            database=reopened_database,
        )
        reopened_feedback = SQLiteFeedbackStore(
            database=reopened_database,
        )

        restored_observation = reopened_memory.get(
            "restart-observation-001"
        )
        restored_feedback = reopened_feedback.get(
            "restart-feedback-001"
        )

        assert restored_observation is not None
        assert restored_observation.model_id == "restart-slm"
        assert restored_observation.task_type == "summarization"
        assert restored_observation.metadata == {"session": 1}
        assert restored_observation.quality_score == 0.93

        assert restored_feedback is not None
        assert restored_feedback.model_id == "restart-slm"
        assert restored_feedback.task_type == "summarization"
        assert restored_feedback.reward == 0.9
        assert restored_feedback.metadata == {
            "source": "restart-test"
        }

        assert reopened_memory.database is reopened_feedback.database

        print("OBSERVATIONS SURVIVE DATABASE RESTART: PASS")
        print("FEEDBACK SURVIVES DATABASE RESTART: PASS")
        print("REOPENED STORES SHARE DATABASE: PASS")

        reopened_database.close()
        print("REOPENED DATABASE CLOSED: PASS")

    print("=" * 58)
    print("MODELNOW RUNTIME RESTART PERSISTENCE TEST: PASS")
    print("=" * 58)


if __name__ == "__main__":
    main()
