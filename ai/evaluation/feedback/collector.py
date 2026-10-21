"""Validated human feedback records and collection."""
from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping
from uuid import uuid4


@dataclass(frozen=True)
class FeedbackRecord:
    feedback_id: str
    case_id: str
    model_name: str
    rating: int
    comment: str = ""
    created_at: str = ""
    metadata: Mapping[str, Any] = field(default_factory=dict)


def validate_feedback(
    case_id: str,
    model_name: str,
    rating: int,
    comment: str = "",
    metadata: Mapping[str, Any] | None = None,
) -> None:
    """Validate feedback fields before creating a record."""
    for name, value in (("case_id", case_id), ("model_name", model_name)):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{name} must be a non-empty string")

    if isinstance(rating, bool) or not isinstance(rating, int):
        raise ValueError("rating must be an integer from 1 to 5")
    if not 1 <= rating <= 5:
        raise ValueError("rating must be an integer from 1 to 5")

    if not isinstance(comment, str):
        raise ValueError("comment must be a string")

    if metadata is not None and not isinstance(metadata, Mapping):
        raise ValueError("metadata must be a mapping")


def collect_feedback(
    case_id: str,
    model_name: str,
    rating: int,
    comment: str = "",
    metadata: Mapping[str, Any] | None = None,
) -> FeedbackRecord:
    """Validate and create a timestamped feedback record."""
    validate_feedback(case_id, model_name, rating, comment, metadata)
    return FeedbackRecord(
        feedback_id=str(uuid4()),
        case_id=case_id.strip(),
        model_name=model_name.strip(),
        rating=rating,
        comment=comment.strip(),
        created_at=datetime.now(timezone.utc).isoformat(),
        metadata=dict(metadata or {}),
    )


def feedback_to_dict(record: FeedbackRecord) -> dict[str, Any]:
    """Convert a validated feedback record to a dictionary."""
    if not isinstance(record, FeedbackRecord):
        raise ValueError("record must be a FeedbackRecord")
    result = asdict(record)
    return result
