from __future__ import annotations

import hashlib
import json
import time
import uuid
from typing import Any


def generate_request_id(prefix: str = "req") -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def generate_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def utc_timestamp() -> float:
    return time.time()


def normalize_provider_name(name: str) -> str:
    if not name:
        raise ValueError("Provider name cannot be empty")

    return (
        name.strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


def normalize_model_name(name: str) -> str:
    if not name:
        raise ValueError("Model name cannot be empty")

    return name.strip().lower()


def stable_hash(value: Any) -> str:
    serialized = json.dumps(
        value,
        sort_keys=True,
        default=str,
        separators=(",", ":"),
    )

    return hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()


def redact_secret(
    value: str | None,
    visible_chars: int = 4,
) -> str | None:
    if value is None:
        return None

    if len(value) <= visible_chars:
        return "*" * len(value)

    return (
        value[:visible_chars]
        + "*" * (len(value) - visible_chars)
    )