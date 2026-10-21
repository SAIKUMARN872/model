from __future__ import annotations

import json
import math
from threading import RLock
from typing import Any

from ai.memory.storage.database import MemoryDatabase
from ai.routing_engine.learning_router.feedback import (
    FeedbackStore,
    RoutingFeedback,
)
from ai.routing_engine.model_memory.memory import MemoryRecord, ModelMemory


def _finite_number(value: Any, field: str) -> float:
    if isinstance(value, bool):
        raise ValueError(f"{field} must be a finite number")
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"{field} must be a finite number") from exc
    if not math.isfinite(number):
        raise ValueError(f"{field} must be a finite number")
    return number


def _metadata_json(metadata: dict[str, Any]) -> str:
    if not isinstance(metadata, dict):
        raise ValueError("metadata must be a dictionary")
    try:
        return json.dumps(
            metadata,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        )
    except (TypeError, ValueError) as exc:
        raise ValueError("metadata must be JSON serializable") from exc


def _metadata_from_json(value: str) -> dict[str, Any]:
    result = json.loads(value)
    if not isinstance(result, dict):
        raise ValueError("stored metadata must be a JSON object")
    return result


def _ensure_schema(database: MemoryDatabase) -> None:
    database.initialize()
    with database.transaction() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS routing_model_observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT NOT NULL,
                model_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                tier TEXT NOT NULL,
                quality_score REAL NOT NULL,
                latency_ms REAL NOT NULL,
                cost REAL NOT NULL,
                success INTEGER NOT NULL,
                task_type TEXT,
                metadata_json TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_observations_model_time
            ON routing_model_observations(model_id, created_at DESC, id DESC)
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_observations_task_time
            ON routing_model_observations(task_type, created_at DESC, id DESC)
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_observations_request
            ON routing_model_observations(request_id)
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS routing_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT NOT NULL,
                model_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                tier TEXT NOT NULL,
                task_type TEXT NOT NULL,
                quality_score REAL NOT NULL,
                latency_ms REAL NOT NULL,
                cost REAL NOT NULL,
                success INTEGER NOT NULL,
                reward REAL,
                metadata_json TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_feedback_model_time
            ON routing_feedback(model_id, created_at DESC, id DESC)
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_feedback_task_time
            ON routing_feedback(task_type, created_at DESC, id DESC)
        """)
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_routing_feedback_request
            ON routing_feedback(request_id)
        """)


class SQLiteModelMemory(ModelMemory):
    """ModelMemory-compatible observations backed by SQLite."""

    def __init__(
        self,
        database: MemoryDatabase | None = None,
        *,
        database_path: str = "data/modelnow_routing.db",
        max_records: int = 10_000,
    ) -> None:
        super().__init__(max_records=max_records)
        self.database = database or MemoryDatabase(database_path)
        _ensure_schema(self.database)
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT request_id, model_id, provider, tier, quality_score,
                       latency_ms, cost, success, task_type, metadata_json,
                       created_at
                FROM routing_model_observations
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """,
                (self.max_records,),
            ).fetchall()
        for row in reversed(rows):
            super().add(self._from_row(row))

    @staticmethod
    def _from_row(row: Any) -> MemoryRecord:
        return MemoryRecord(
            request_id=row["request_id"],
            model_id=row["model_id"],
            provider=row["provider"],
            tier=row["tier"],
            quality_score=row["quality_score"],
            latency_ms=row["latency_ms"],
            cost=row["cost"],
            success=bool(row["success"]),
            task_type=row["task_type"],
            metadata=_metadata_from_json(row["metadata_json"]),
            created_at=row["created_at"],
        )

    def add(self, record: MemoryRecord) -> MemoryRecord:
        if not isinstance(record, MemoryRecord):
            raise TypeError("record must be a MemoryRecord instance")
        created_at = _finite_number(record.created_at, "created_at")
        quality = _finite_number(record.quality_score, "quality_score")
        latency = _finite_number(record.latency_ms, "latency_ms")
        cost = _finite_number(record.cost, "cost")
        metadata = _metadata_json(record.metadata)
        with self.database.transaction() as connection:
            connection.execute(
                """
                INSERT INTO routing_model_observations
                (request_id, model_id, provider, tier, quality_score,
                 latency_ms, cost, success, task_type, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.request_id, record.model_id, record.provider,
                    record.tier, quality, latency, cost, int(record.success),
                    record.task_type, metadata, created_at,
                ),
            )
        return super().add(record)

    def add_many(self, records: list[MemoryRecord]) -> int:
        if not isinstance(records, list):
            raise TypeError("records must be a list")
        for record in records:
            if not isinstance(record, MemoryRecord):
                raise TypeError("all records must be MemoryRecord instances")

        rows = []
        for record in records:
            rows.append((
                record.request_id, record.model_id, record.provider, record.tier,
                _finite_number(record.quality_score, "quality_score"),
                _finite_number(record.latency_ms, "latency_ms"),
                _finite_number(record.cost, "cost"), int(record.success),
                record.task_type, _metadata_json(record.metadata),
                _finite_number(record.created_at, "created_at"),
            ))
        with self.database.transaction() as connection:
            connection.executemany(
                """
                INSERT INTO routing_model_observations
                (request_id, model_id, provider, tier, quality_score,
                 latency_ms, cost, success, task_type, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
            )
        return super().add_many(records)

    def clear(self) -> int:
        with self.database.transaction() as connection:
            row = connection.execute(
                "SELECT COUNT(*) AS n FROM routing_model_observations"
            ).fetchone()
            connection.execute("DELETE FROM routing_model_observations")
        super().clear()
        return int(row["n"])


class SQLiteFeedbackStore(FeedbackStore):
    """FeedbackStore-compatible feedback history backed by SQLite."""

    def __init__(
        self,
        database: MemoryDatabase | None = None,
        *,
        database_path: str = "data/modelnow_routing.db",
        max_records: int = 10_000,
    ) -> None:
        super().__init__(max_records=max_records)
        self.database = database or MemoryDatabase(database_path)
        self._db_lock = RLock()
        _ensure_schema(self.database)
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT request_id, model_id, provider, tier, task_type,
                       quality_score, latency_ms, cost, success, reward,
                       metadata_json, created_at
                FROM routing_feedback
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """,
                (self.max_records,),
            ).fetchall()
        for row in reversed(rows):
            super().add(self._from_row(row))

    @staticmethod
    def _from_row(row: Any) -> RoutingFeedback:
        return RoutingFeedback(
            request_id=row["request_id"],
            model_id=row["model_id"],
            provider=row["provider"],
            tier=row["tier"],
            task_type=row["task_type"],
            quality_score=row["quality_score"],
            latency_ms=row["latency_ms"],
            cost=row["cost"],
            success=bool(row["success"]),
            reward=row["reward"],
            metadata=_metadata_from_json(row["metadata_json"]),
            created_at=row["created_at"],
        )

    def add(self, feedback: RoutingFeedback) -> RoutingFeedback:
        if not isinstance(feedback, RoutingFeedback):
            raise TypeError("feedback must be a RoutingFeedback instance")
        values = (
            feedback.request_id, feedback.model_id, feedback.provider,
            feedback.tier, feedback.task_type,
            _finite_number(feedback.quality_score, "quality_score"),
            _finite_number(feedback.latency_ms, "latency_ms"),
            _finite_number(feedback.cost, "cost"), int(feedback.success),
            None if feedback.reward is None else _finite_number(feedback.reward, "reward"),
            _metadata_json(feedback.metadata),
            _finite_number(feedback.created_at, "created_at"),
        )
        with self._db_lock:
            with self.database.transaction() as connection:
                connection.execute(
                    """
                    INSERT INTO routing_feedback
                    (request_id, model_id, provider, tier, task_type,
                     quality_score, latency_ms, cost, success, reward,
                     metadata_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
            return super().add(feedback)

    def add_many(self, feedback_items: list[RoutingFeedback]) -> int:
        if not isinstance(feedback_items, list):
            raise TypeError("feedback_items must be a list")
        for item in feedback_items:
            if not isinstance(item, RoutingFeedback):
                raise TypeError("all items must be RoutingFeedback instances")
        rows = []
        for item in feedback_items:
            rows.append((
                item.request_id, item.model_id, item.provider, item.tier,
                item.task_type,
                _finite_number(item.quality_score, "quality_score"),
                _finite_number(item.latency_ms, "latency_ms"),
                _finite_number(item.cost, "cost"), int(item.success),
                None if item.reward is None else _finite_number(item.reward, "reward"),
                _metadata_json(item.metadata),
                _finite_number(item.created_at, "created_at"),
            ))
        with self._db_lock:
            with self.database.transaction() as connection:
                connection.executemany(
                    """
                    INSERT INTO routing_feedback
                    (request_id, model_id, provider, tier, task_type,
                     quality_score, latency_ms, cost, success, reward,
                     metadata_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    rows,
                )
            return super().add_many(feedback_items)

    def records(self) -> list[RoutingFeedback]:
        with self._db_lock:
            return super().records()

    def recent(self, limit: int = 10) -> list[RoutingFeedback]:
        with self._db_lock:
            return super().recent(limit)

    def get(self, request_id: str) -> RoutingFeedback | None:
        with self._db_lock:
            return super().get(request_id)

    def count(self) -> int:
        with self._db_lock:
            return super().count()

    def clear(self) -> int:
        with self._db_lock:
            with self.database.transaction() as connection:
                row = connection.execute(
                    "SELECT COUNT(*) AS n FROM routing_feedback"
                ).fetchone()
                connection.execute("DELETE FROM routing_feedback")
            super().clear()
            return int(row["n"])

    def for_model(self, model_id: str) -> list[RoutingFeedback]:
        with self._db_lock:
            return super().for_model(model_id)

    def for_task(self, task_type: str) -> list[RoutingFeedback]:
        with self._db_lock:
            return super().for_task(task_type)


__all__ = ["SQLiteFeedbackStore", "SQLiteModelMemory"]
