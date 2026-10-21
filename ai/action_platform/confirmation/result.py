"""Result wrapper for ModelNow action confirmation operations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .confirmation import ActionConfirmation


@dataclass(frozen=True)
class ActionConfirmationResult:
    """Represent the outcome of a confirmation operation."""

    success: bool
    confirmation: ActionConfirmation | None = None
    error: str | None = None

    def __post_init__(self) -> None:
        if self.success and self.confirmation is None:
            raise ValueError(
                "A successful result requires a confirmation record."
            )
        if self.success and self.error is not None:
            raise ValueError(
                "A successful result cannot contain an error."
            )
        if not self.success and self.confirmation is None and not (
            isinstance(self.error, str) and self.error.strip()
        ):
            raise ValueError(
                "A failed result requires a confirmation or an error message."
            )

    @property
    def confirmed(self) -> bool:
        """Whether the associated confirmation verifies completion."""
        return bool(
            self.success
            and self.confirmation is not None
            and self.confirmation.confirmed
        )

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-friendly representation."""
        return {
            "success": self.success,
            "confirmed": self.confirmed,
            "confirmation": (
                self.confirmation.to_dict()
                if self.confirmation is not None
                else None
            ),
            "error": self.error,
        }


def confirmation_result(
    confirmation: ActionConfirmation,
) -> ActionConfirmationResult:
    """Wrap a verification record without treating pending as confirmed."""
    return ActionConfirmationResult(
        success=True,
        confirmation=confirmation,
    )
