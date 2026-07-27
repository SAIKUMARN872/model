"""
Domain Services

Enterprise Domain Services

Responsibilities
----------------
- Business Rules
- Domain Validation
- Entity Operations
- Domain Utilities
"""

from __future__ import annotations

from abc import ABC
from datetime import datetime, UTC
from typing import Any

from config.logging import log


class DomainService(ABC):
    """
    Base Domain Service
    """

    @staticmethod
    def now() -> datetime:
        """
        Return current UTC time.
        """
        return datetime.now(UTC)

    @staticmethod
    def validate_not_none(
        value: Any,
        field_name: str,
    ) -> None:
        """
        Validate value is not None.
        """
        if value is None:
            raise ValueError(
                f"{field_name} cannot be None."
            )

    @staticmethod
    def validate_not_empty(
        value: str,
        field_name: str,
    ) -> None:
        """
        Validate string is not empty.
        """
        if not value or not value.strip():
            raise ValueError(
                f"{field_name} cannot be empty."
            )

    @staticmethod
    def validate_positive(
        value: int | float,
        field_name: str,
    ) -> None:
        """
        Validate numeric value is positive.
        """
        if value <= 0:
            raise ValueError(
                f"{field_name} must be greater than zero."
            )

    @staticmethod
    def validate_email(
        email: str,
    ) -> bool:
        """
        Basic email validation.
        """
        return (
            isinstance(email, str)
            and "@" in email
            and "." in email
        )

    @staticmethod
    def validate_length(
        value: str,
        minimum: int = 1,
        maximum: int = 255,
    ) -> None:
        """
        Validate string length.
        """
        length = len(value)

        if length < minimum:
            raise ValueError(
                f"Minimum length is {minimum}."
            )

        if length > maximum:
            raise ValueError(
                f"Maximum length is {maximum}."
            )

    @staticmethod
    def validate_uuid(
        value: str,
    ) -> bool:
        """
        Validate UUID format.
        """
        from uuid import UUID

        try:
            UUID(value)
            return True

        except Exception:
            return False

    @staticmethod
    def log_event(
        event_name: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """
        Log domain event.
        """
        log.info(
            f"Domain Event: {event_name}",
            metadata=metadata or {},
        )

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
    ) -> dict[str, Any]:
        """
        Standard success response.
        """
        return {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.now(UTC).isoformat(),
        }

    @staticmethod
    def failure(
        message: str,
    ) -> dict[str, Any]:
        """
        Standard failure response.
        """
        return {
            "success": False,
            "message": message,
            "timestamp": datetime.now(UTC).isoformat(),
        }

    @staticmethod
    def merge_metadata(
        *metadata: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Merge multiple dictionaries.
        """
        result: dict[str, Any] = {}

        for item in metadata:
            result.update(item)

        return result 