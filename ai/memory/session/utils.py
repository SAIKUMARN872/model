from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Mapping


MAX_IDENTIFIER_LENGTH = 200
MAX_METADATA_BYTES = 65536
MAX_SESSION_NAME_LENGTH = 200
MAX_CONTEXT_ITEMS = 1000
MAX_CONTEXT_ITEM_BYTES = 262144


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string")

    value = value.strip()
    if not value or len(value) > MAX_IDENTIFIER_LENGTH:
        raise ValueError(f"{field} must contain 1-{MAX_IDENTIFIER_LENGTH} characters")

    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise ValueError(f"{field} contains control characters")

    return value


def validate_session_name(value: str) -> str:
    if not isinstance(value, str):
        raise ValueError("session name must be a string")

    value = value.strip()
    if not value or len(value) > MAX_SESSION_NAME_LENGTH:
        raise ValueError(
            f"session name must contain 1-{MAX_SESSION_NAME_LENGTH} characters"
        )

    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise ValueError("session name contains control characters")

    return value


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}

    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")

    try:
        copied = dict(value)
        encoded = json.dumps(
            copied,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("metadata must contain finite JSON-compatible values") from exc

    if len(encoded) > MAX_METADATA_BYTES:
        raise ValueError("metadata exceeds the maximum size")

    return json.loads(encoded.decode("utf-8"))


def validate_context_item(value: Any) -> Any:
    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("context item must be JSON-compatible") from exc

    if len(encoded) > MAX_CONTEXT_ITEM_BYTES:
        raise ValueError("context item exceeds the maximum size")

    return json.loads(encoded.decode("utf-8"))


def validate_positive_integer(value: int, field: str = "value") -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError(f"{field} must be a positive integer")
    return value


def normalize_timestamp(value: datetime | None = None) -> datetime:
    if value is None:
        return utc_now()

    if not isinstance(value, datetime):
        raise ValueError("timestamp must be a datetime")

    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("timestamp must be timezone-aware")

    return value.astimezone(timezone.utc)


def parse_timestamp(value: str) -> datetime:
    if not isinstance(value, str):
        raise ValueError("timestamp must be an ISO-8601 string")

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("invalid ISO-8601 timestamp") from exc

    return normalize_timestamp(parsed)


def new_session_id() -> str:
    return str(uuid.uuid4())


def normalize_session_key(value: str) -> str:
    value = validate_identifier(value, "session key")
    return re.sub(r"\s+", " ", value).casefold()


def redact_context_for_log(context: Mapping[str, Any]) -> dict[str, Any]:
    sensitive_keys = {
        "password", "token", "access_token", "refresh_token",
        "api_key", "secret", "authorization", "cookie",
    }

    def redact(value: Any) -> Any:
        if isinstance(value, Mapping):
            return {
                str(key): (
                    "[REDACTED]"
                    if str(key).casefold() in sensitive_keys
                    else redact(item)
                )
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [redact(item) for item in value]
        return value

    return redact(context)
