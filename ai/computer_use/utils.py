from __future__ import annotations

import uuid
from typing import Any

from .constants import RiskLevel


def generate_id(prefix: str = "cu") -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def clamp_coordinate(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def normalize_coordinates(
    x: int,
    y: int,
    width: int,
    height: int,
) -> tuple[int, int]:
    return (
        clamp_coordinate(x, 0, max(width - 1, 0)),
        clamp_coordinate(y, 0, max(height - 1, 0)),
    )


def calculate_center(
    x: int,
    y: int,
    width: int,
    height: int,
) -> tuple[int, int]:
    return x + width // 2, y + height // 2


def classify_risk(action_type: str, parameters: dict[str, Any]) -> RiskLevel:
    action = action_type.lower()

    if action in {"payment", "purchase", "delete", "submit", "send"}:
        return RiskLevel.HIGH

    if action in {"download", "upload", "install", "login"}:
        return RiskLevel.MEDIUM

    if action in {"move", "click", "type", "scroll", "screenshot"}:
        return RiskLevel.LOW

    return RiskLevel.MEDIUM


def requires_approval(
    action_type: str,
    parameters: dict[str, Any] | None = None,
) -> bool:
    risk = classify_risk(action_type, parameters or {})
    return risk in {RiskLevel.HIGH, RiskLevel.CRITICAL}


def validate_screen_size(width: int, height: int) -> None:
    if width <= 0 or height <= 0:
        raise ValueError("Screen dimensions must be greater than zero.")


def safe_action_parameters(parameters: dict[str, Any]) -> dict[str, Any]:
    """Return a recursively redacted copy suitable for logs and approval prompts."""
    sensitive_names = {
        "password", "passwd", "secret", "token", "access_token",
        "refresh_token", "api_key", "apikey", "access_key",
        "client_secret", "authorization", "cookie", "credential",
        "credentials",
    }

    def is_sensitive(key: str) -> bool:
        normalized = key.lower().replace("-", "_").replace(" ", "_")
        return (
            normalized in sensitive_names
            or normalized.endswith(("_password", "_passwd", "_secret", "_token",
                                    "_api_key", "_apikey", "_access_key",
                                    "_client_secret", "_authorization",
                                    "_cookie", "_credential", "_credentials"))
        )

    def redact(value: Any) -> Any:
        if isinstance(value, dict):
            return {
                key: "[REDACTED]" if isinstance(key, str) and is_sensitive(key)
                else redact(item)
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [redact(item) for item in value]
        if isinstance(value, tuple):
            return tuple(redact(item) for item in value)
        return value

    return redact(parameters)
