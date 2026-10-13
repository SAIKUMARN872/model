"""Public human-feedback submission helpers."""
from collections.abc import Mapping
from typing import Any

from ai.evaluation.feedback.collector import (
    FeedbackRecord,
    collect_feedback,
    feedback_to_dict,
)


def submit_feedback(
    case_id: str,
    model_name: str,
    rating: int,
    comment: str = "",
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a feedback record and return its serializable representation.

    This function does not persist data to a database or external service.
    """
    return feedback_to_dict(
        collect_feedback(
            case_id=case_id,
            model_name=model_name,
            rating=rating,
            comment=comment,
            metadata=metadata,
        )
    )


__all__ = ["FeedbackRecord", "collect_feedback", "submit_feedback"]
