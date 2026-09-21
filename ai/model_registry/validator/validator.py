from __future__ import annotations

from ..models import ModelRecord
from .rules import ValidationError, validate_model_record


class ModelValidationException(ValueError):
    """
    Raised when a ModelRecord fails canonical registry validation.
    """

    def __init__(
        self,
        errors: list[ValidationError],
    ) -> None:
        self.errors = errors

        message = "; ".join(
            f"{error.field}: {error.message}"
            for error in errors
        )

        super().__init__(
            f"Model validation failed: {message}"
        )


class ModelValidator:
    """
    Validates ModelRecord objects before registry registration.
    """

    def validate(
        self,
        model: ModelRecord,
    ) -> None:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        errors = validate_model_record(model)

        if errors:
            raise ModelValidationException(errors)

    def is_valid(
        self,
        model: ModelRecord,
    ) -> bool:
        if not isinstance(model, ModelRecord):
            return False

        return not validate_model_record(model)


__all__ = [
    "ModelValidator",
    "ModelValidationException",
]
