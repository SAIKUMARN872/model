"""
JSON serializer.

Provides utilities for serializing and deserializing JSON-compatible
objects used throughout the application.
"""

from __future__ import annotations

import json
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from .base import BaseSerializer


class JsonSerializer(BaseSerializer):
    """
    JSON serializer.
    """

    @staticmethod
    def default(value: Any) -> Any:
        """
        Convert non-JSON-native types into JSON-compatible values.
        """

        if isinstance(value, BaseModel):
            return value.model_dump(mode="json")

        if isinstance(value, (datetime, date)):
            return value.isoformat()

        if isinstance(value, UUID):
            return str(value)

        if isinstance(value, Decimal):
            return float(value)

        if isinstance(value, Enum):
            return value.value

        if isinstance(value, bytes):
            return value.decode("utf-8")

        if hasattr(value, "__dict__"):
            return {
                key: val
                for key, val in vars(value).items()
                if not key.startswith("_")
            }

        raise TypeError(
            f"Object of type '{type(value).__name__}' "
            "is not JSON serializable."
        )

    @classmethod
    def dumps(
        cls,
        obj: Any,
        *,
        indent: int | None = None,
        sort_keys: bool = False,
    ) -> str:
        """
        Serialize an object to a JSON string.
        """

        return json.dumps(
            obj,
            default=cls.default,
            ensure_ascii=False,
            indent=indent,
            sort_keys=sort_keys,
        )

    @classmethod
    def loads(cls, data: str) -> Any:
        """
        Deserialize a JSON string.
        """

        return json.loads(data)

    @classmethod
    def to_bytes(
        cls,
        obj: Any,
    ) -> bytes:
        """
        Serialize an object to UTF-8 encoded JSON bytes.
        """

        return cls.dumps(obj).encode("utf-8")

    @classmethod
    def from_bytes(
        cls,
        data: bytes,
    ) -> Any:
        """
        Deserialize UTF-8 encoded JSON bytes.
        """

        return cls.loads(data.decode("utf-8"))

    @classmethod
    def pretty(
        cls,
        obj: Any,
    ) -> str:
        """
        Return formatted JSON.
        """

        return cls.dumps(
            obj,
            indent=4,
            sort_keys=True,
        ) 