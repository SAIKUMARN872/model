"""
Utility functions for the ModelNow cache system.
"""

from __future__ import annotations

import hashlib
import json
import pickle
import time
from dataclasses import asdict, is_dataclass
from typing import Any


def current_time() -> float:
    """Return the current monotonic time."""

    return time.monotonic()


def elapsed_seconds(
    started_at: float,
) -> float:
    """Return elapsed time in seconds."""

    return time.monotonic() - started_at


def is_expired(
    expires_at: float | None,
) -> bool:
    """
    Determine whether a cache entry has expired.
    """

    if expires_at is None:
        return False

    return time.monotonic() >= expires_at


def calculate_expiry(
    ttl: float | None,
) -> float | None:
    """
    Convert a TTL into an absolute monotonic expiration time.
    """

    if ttl is None:
        return None

    if ttl <= 0:
        return time.monotonic()

    return time.monotonic() + ttl


def make_cache_key(
    namespace: str,
    key: Any,
) -> str:
    """
    Build a deterministic cache key.
    """

    if not namespace:
        namespace = "default"

    serialized = serialize(
        key
    )

    digest = hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()

    return (
        f"{namespace.strip()}:{digest}"
    )


def make_function_cache_key(
    namespace: str,
    function_name: str,
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> str:
    """
    Create a deterministic key for a function invocation.
    """

    payload = {
        "function": function_name,
        "args": args,
        "kwargs": kwargs,
    }

    return make_cache_key(
        namespace,
        payload,
    )


def serialize(
    value: Any,
) -> str:
    """
    Serialize a value deterministically.

    JSON is preferred for readability and interoperability.
    pickle is used as a fallback for Python-specific objects.
    """

    value = prepare_value(
        value
    )

    try:

        return json.dumps(
            value,
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )

    except (
        TypeError,
        ValueError,
    ):

        return pickle.dumps(
            value
        ).hex()


def deserialize(
    value: Any,
) -> Any:
    """
    Deserialize a value produced by serialize().
    """

    if value is None:
        return None

    if isinstance(
        value,
        bytes,
    ):

        value = value.decode(
            "utf-8"
        )

    if not isinstance(
        value,
        str,
    ):

        return value

    try:

        return json.loads(
            value
        )

    except (
        json.JSONDecodeError,
        TypeError,
        ValueError,
    ):

        try:

            return pickle.loads(
                bytes.fromhex(value)
            )

        except Exception:

            return value


def prepare_value(
    value: Any,
) -> Any:
    """
    Convert common Python objects into serializable values.
    """

    if value is None:
        return None

    if isinstance(
        value,
        (
            str,
            int,
            float,
            bool,
        ),
    ):
        return value

    if is_dataclass(value):

        return prepare_value(
            asdict(value)
        )

    if isinstance(
        value,
        dict,
    ):

        return {
            str(key): prepare_value(
                item
            )
            for key, item in value.items()
        }

    if isinstance(
        value,
        (list, tuple, set),
    ):

        return [
            prepare_value(item)
            for item in value
        ]

    if hasattr(
        value,
        "to_dict",
    ):

        return prepare_value(
            value.to_dict()
        )

    return str(value)


def normalize_ttl(
    ttl: float | None,
) -> float | None:
    """
    Validate and normalize TTL.
    """

    if ttl is None:
        return None

    ttl = float(ttl)

    if ttl < 0:

        raise ValueError(
            "TTL cannot be negative"
        )

    return ttl


def normalize_key(
    key: Any,
) -> str:
    """
    Convert a cache key into a safe string.
    """

    if isinstance(
        key,
        str,
    ):

        key = key.strip()

        if not key:

            raise ValueError(
                "Cache key cannot be empty"
            )

        return key

    return serialize(key)


def estimate_size(
    value: Any,
) -> int:
    """
    Estimate the serialized size of a cached value.
    """

    try:

        return len(
            serialize(value).encode(
                "utf-8"
            )
        )

    except Exception:

        return 0