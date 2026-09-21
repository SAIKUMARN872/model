from __future__ import annotations

from typing import Any


def normalize_messages(
    messages: list[Any],
) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []

    for message in messages:
        role = getattr(message, "role", None)
        content = getattr(message, "content", None)

        if isinstance(message, dict):
            role = message.get("role", role)
            content = message.get("content", content)

        normalized.append(
            {
                "role": role or "user",
                "content": content or "",
            }
        )

    return normalized


def is_gemma_model(model_id: str) -> bool:
    value = model_id.lower()

    return (
        value.startswith("google/gemma")
        or value.startswith("gemma-")
        or value.startswith("gemma_")
    )