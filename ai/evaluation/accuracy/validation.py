"""
Validation helpers for evaluation data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ValidationResult:
    """Validation result."""

    valid: bool

    errors: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    details: dict[str, Any] = field(
        default_factory=dict
    )


class Validator:
    """Validates evaluation datasets."""

    def validate_pair(
        self,
        prediction: Any,
        expected: Any,
    ) -> ValidationResult:

        errors: list[str] = []

        if prediction is None:

            errors.append(
                "Prediction is missing."
            )

        if expected is None:

            errors.append(
                "Expected value is missing."
            )

        return ValidationResult(
            valid=not errors,
            errors=errors,
        )

    def validate_dataset(
        self,
        predictions: list[Any],
        expected: list[Any],
    ) -> ValidationResult:

        errors: list[str] = []

        warnings: list[str] = []

        if not isinstance(
            predictions,
            list,
        ):

            errors.append(
                "predictions must be a list."
            )

        if not isinstance(
            expected,
            list,
        ):

            errors.append(
                "expected must be a list."
            )

        if errors:

            return ValidationResult(
                valid=False,
                errors=errors,
            )

        if len(predictions) != len(expected):

            errors.append(
                "predictions and expected must "
                "have the same length."
            )

        if not predictions:

            warnings.append(
                "Dataset is empty."
            )

        return ValidationResult(
            valid=not errors,
            errors=errors,
            warnings=warnings,
            details={
                "prediction_count":
                    len(predictions),
                "expected_count":
                    len(expected),
            },
        )

    def validate_score(
        self,
        score: float,
    ) -> ValidationResult:

        errors: list[str] = []

        if not 0 <= score <= 1:

            errors.append(
                "Score must be between 0 and 1."
            )

        return ValidationResult(
            valid=not errors,
            errors=errors,
        )