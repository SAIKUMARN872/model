from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Iterable, Mapping
from uuid import uuid4

from .models import (
    FeedbackRecord,
    FeedbackSignal,
    FeedbackType,
    LearningObservation,
    LearningObjective,
)


def _to_decimal(value: Any, field_name: str) -> Decimal:
    try:
        result = Decimal(str(value))
    except (ValueError, TypeError, ArithmeticError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc

    if not result.is_finite():
        raise ValueError(f"{field_name} must be finite")

    return result


def _normalize_enum(enum_type, value, field_name: str):
    if isinstance(value, enum_type):
        return value

    try:
        return enum_type(str(value).strip().lower())
    except ValueError as exc:
        allowed = ", ".join(item.value for item in enum_type)
        raise ValueError(
            f"{field_name} must be one of: {allowed}"
        ) from exc


def _normalize_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} cannot be empty")
    return value.strip()


class FeedbackCollector:
    """Thread-safe in-memory collection and normalization of feedback."""

    def __init__(self, *, max_records: int = 10000) -> None:
        if isinstance(max_records, bool) or not isinstance(max_records, int):
            raise TypeError("max_records must be an integer")
        if max_records < 1:
            raise ValueError("max_records must be at least 1")

        self.max_records = max_records
        self._records: list[FeedbackRecord] = []
        self._lock = RLock()

    def record(
        self,
        *,
        request_id: str,
        feedback_type: FeedbackType | str,
        signal: FeedbackSignal | str,
        value: Decimal | int | float | str,
        model: str | None = None,
        provider: str | None = None,
        feedback_id: str | None = None,
        timestamp: datetime | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> FeedbackRecord:
        normalized_value = _to_decimal(value, "value")

        record = FeedbackRecord(
            feedback_id=(
                _normalize_text(feedback_id, "feedback_id")
                if feedback_id is not None
                else uuid4().hex
            ),
            request_id=_normalize_text(request_id, "request_id"),
            feedback_type=_normalize_enum(
                FeedbackType, feedback_type, "feedback_type"
            ),
            signal=_normalize_enum(
                FeedbackSignal, signal, "signal"
            ),
            value=normalized_value,
            timestamp=timestamp or datetime.now(timezone.utc),
            model=(
                _normalize_text(model, "model")
                if model is not None
                else None
            ),
            provider=(
                _normalize_text(provider, "provider")
                if provider is not None
                else None
            ),
            metadata=dict(metadata or {}),
        )

        with self._lock:
            self._records.append(record)
            overflow = len(self._records) - self.max_records
            if overflow > 0:
                del self._records[:overflow]

        return record

    def record_explicit(
        self,
        request_id: str,
        *,
        positive: bool,
        value: Decimal | int | float | str | None = None,
        model: str | None = None,
        provider: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> FeedbackRecord:
        signal = (
            FeedbackSignal.POSITIVE
            if positive
            else FeedbackSignal.NEGATIVE
        )
        normalized_value = (
            Decimal("1")
            if value is None and positive
            else Decimal("-1")
            if value is None
            else _to_decimal(value, "value")
        )

        return self.record(
            request_id=request_id,
            feedback_type=FeedbackType.EXPLICIT,
            signal=signal,
            value=normalized_value,
            model=model,
            provider=provider,
            metadata=metadata,
        )

    def record_evaluation(
        self,
        request_id: str,
        *,
        score: Decimal | int | float | str,
        model: str | None = None,
        provider: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> FeedbackRecord:
        normalized_score = _to_decimal(score, "score")
        if not Decimal("0") <= normalized_score <= Decimal("1"):
            raise ValueError("score must be between 0 and 1")

        signal = (
            FeedbackSignal.POSITIVE
            if normalized_score > Decimal("0.5")
            else FeedbackSignal.NEGATIVE
            if normalized_score < Decimal("0.5")
            else FeedbackSignal.NEUTRAL
        )

        return self.record(
            request_id=request_id,
            feedback_type=FeedbackType.EVALUATION,
            signal=signal,
            value=normalized_score,
            model=model,
            provider=provider,
            metadata=metadata,
        )

    def record_outcome(
        self,
        observation: LearningObservation,
        *,
        metadata: Mapping[str, Any] | None = None,
    ) -> FeedbackRecord:
        if not isinstance(observation, LearningObservation):
            raise TypeError("observation must be a LearningObservation")

        signal = (
            FeedbackSignal.NEGATIVE
            if not observation.success
            else FeedbackSignal.POSITIVE
            if observation.reward > 0
            else FeedbackSignal.NEGATIVE
            if observation.reward < 0
            else FeedbackSignal.NEUTRAL
        )

        combined_metadata = observation.as_dict()
        combined_metadata.update(dict(metadata or {}))

        return self.record(
            request_id=observation.request_id,
            feedback_type=FeedbackType.OUTCOME,
            signal=signal,
            value=max(
                Decimal("-1"),
                min(Decimal("1"), observation.reward),
            ),
            model=observation.model,
            provider=observation.provider,
            metadata=combined_metadata,
        )

    def get(self, feedback_id: str) -> FeedbackRecord | None:
        with self._lock:
            for record in reversed(self._records):
                if record.feedback_id == feedback_id:
                    return record
        return None

    def records(
        self,
        *,
        request_id: str | None = None,
        model: str | None = None,
        provider: str | None = None,
        feedback_type: FeedbackType | str | None = None,
        signal: FeedbackSignal | str | None = None,
        limit: int | None = None,
    ) -> list[FeedbackRecord]:
        if limit is not None:
            if isinstance(limit, bool) or not isinstance(limit, int):
                raise TypeError("limit must be an integer")
            if limit < 0:
                raise ValueError("limit cannot be negative")

        normalized_type = (
            _normalize_enum(FeedbackType, feedback_type, "feedback_type")
            if feedback_type is not None
            else None
        )
        normalized_signal = (
            _normalize_enum(FeedbackSignal, signal, "signal")
            if signal is not None
            else None
        )

        with self._lock:
            result = [
                record
                for record in self._records
                if (request_id is None or record.request_id == request_id)
                and (model is None or record.model == model)
                and (provider is None or record.provider == provider)
                and (
                    normalized_type is None
                    or record.feedback_type == normalized_type
                )
                and (
                    normalized_signal is None
                    or record.signal == normalized_signal
                )
            ]

        if limit is not None:
            result = result[-limit:] if limit else []

        return result

    def summary(self) -> dict[str, Any]:
        with self._lock:
            items = list(self._records)

        signals = Counter(record.signal.value for record in items)
        types = Counter(record.feedback_type.value for record in items)

        return {
            "total_records": len(items),
            "positive_count": signals[FeedbackSignal.POSITIVE.value],
            "negative_count": signals[FeedbackSignal.NEGATIVE.value],
            "neutral_count": signals[FeedbackSignal.NEUTRAL.value],
            "by_type": dict(types),
            "by_signal": dict(signals),
        }

    def clear(self) -> int:
        with self._lock:
            count = len(self._records)
            self._records.clear()
        return count

    def __len__(self) -> int:
        with self._lock:
            return len(self._records)


def create_feedback_collector(
    *,
    max_records: int = 10000,
) -> FeedbackCollector:
    return FeedbackCollector(max_records=max_records)


__all__ = [
    "FeedbackCollector",
    "create_feedback_collector",
]
