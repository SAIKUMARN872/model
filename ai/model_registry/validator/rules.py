from __future__ import annotations

from dataclasses import dataclass

from ..models import ModelRecord, ModelTier
from .checks import (
    are_valid_aliases,
    is_non_empty_string,
    is_non_negative_number,
    is_positive_integer,
    is_valid_score,
)


@dataclass(frozen=True)
class ValidationError:
    field: str
    message: str


def validate_model_record(
    model: ModelRecord,
) -> list[ValidationError]:
    errors: list[ValidationError] = []

    if not is_non_empty_string(model.provider):
        errors.append(
            ValidationError(
                "provider",
                "provider must be a non-empty string",
            )
        )

    if not is_non_empty_string(model.model_id):
        errors.append(
            ValidationError(
                "model_id",
                "model_id must be a non-empty string",
            )
        )

    if not is_non_empty_string(model.display_name):
        errors.append(
            ValidationError(
                "display_name",
                "display_name must be a non-empty string",
            )
        )

    if not isinstance(model.tier, ModelTier):
        errors.append(
            ValidationError(
                "tier",
                "tier must be a valid ModelTier",
            )
        )

    if not is_non_negative_number(model.context_window):
        errors.append(
            ValidationError(
                "context_window",
                "context_window must be non-negative",
            )
        )

    if not is_non_negative_number(model.max_output_tokens):
        errors.append(
            ValidationError(
                "max_output_tokens",
                "max_output_tokens must be non-negative",
            )
        )

    pricing = model.pricing

    if not is_non_negative_number(
        pricing.input_per_1m_tokens
    ):
        errors.append(
            ValidationError(
                "pricing.input_per_1m_tokens",
                "input pricing must be non-negative",
            )
        )

    if not is_non_negative_number(
        pricing.output_per_1m_tokens
    ):
        errors.append(
            ValidationError(
                "pricing.output_per_1m_tokens",
                "output pricing must be non-negative",
            )
        )

    if model.latency_ms is not None and not is_non_negative_number(
        model.latency_ms
    ):
        errors.append(
            ValidationError(
                "latency_ms",
                "latency_ms must be non-negative",
            )
        )

    if model.quality_score is not None and not is_valid_score(
        model.quality_score
    ):
        errors.append(
            ValidationError(
                "quality_score",
                "quality_score must be between 0.0 and 1.0",
            )
        )

    if not are_valid_aliases(model.aliases):
        errors.append(
            ValidationError(
                "aliases",
                "aliases must be a tuple of non-empty strings",
            )
        )

    if model.context_window == 0:
        errors.append(
            ValidationError(
                "context_window",
                "context_window must be greater than zero",
            )
        )

    if model.max_output_tokens == 0:
        errors.append(
            ValidationError(
                "max_output_tokens",
                "max_output_tokens must be greater than zero",
            )
        )

    return errors


__all__ = [
    "ValidationError",
    "validate_model_record",
]

