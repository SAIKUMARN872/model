"""
Cookie security helpers.

Sensitive cookie values should not be logged or exposed
unnecessarily.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
from typing import Any


SENSITIVE_COOKIE_NAMES = {
    "session",
    "sessionid",
    "session_id",
    "token",
    "access_token",
    "refresh_token",
    "auth",
    "authorization",
}


def is_sensitive_cookie(
    name: str,
) -> bool:

    normalized = name.strip().lower()

    return (
        normalized in SENSITIVE_COOKIE_NAMES
        or "token" in normalized
        or "session" in normalized
        or "auth" in normalized
    )


def mask_cookie_value(
    value: str,
    visible_chars: int = 4,
) -> str:

    if not value:
        return ""

    if visible_chars < 0:
        raise ValueError(
            "visible_chars cannot be negative."
        )

    if len(value) <= visible_chars:

        return "*" * len(value)

    return (
        value[:visible_chars]
        + "..."
        + "*" * 4
    )


def sanitize_cookie(
    cookie: dict[str, Any],
) -> dict[str, Any]:

    result = dict(cookie)

    if (
        "value" in result
        and is_sensitive_cookie(
            str(result.get("name", ""))
        )
    ):

        result["value"] = mask_cookie_value(
            str(result["value"])
        )

    return result


def sanitize_cookies(
    cookies: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    return [
        sanitize_cookie(cookie)
        for cookie in cookies
    ]


def generate_encryption_key() -> str:
    """
    Generate a random key.

    This is useful as a secret-generation helper.
    Store the resulting key securely.
    """

    return secrets.token_urlsafe(32)


def hash_value(
    value: str,
) -> str:

    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()


def secure_compare(
    value_a: str,
    value_b: str,
) -> bool:

    return hmac.compare_digest(
        value_a,
        value_b,
    )