from __future__ import annotations

from typing import Any


def build_messages(messages) -> list[dict[str, Any]]:
    return [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages
    ]


def extract_content(response: Any) -> str:
    choices = getattr(response, "choices", None) or []
    if not choices:
        return ""
    message = getattr(choices[0], "message", None)
    if message is None:
        return ""
    return getattr(message, "content", None) or ""


def extract_usage(response: Any) -> dict[str, int]:
    usage = getattr(response, "usage", None)
    if usage is None:
        return {
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
        }
    return {
        "input_tokens": getattr(usage, "prompt_tokens", 0),
        "output_tokens": getattr(usage, "completion_tokens", 0),
        "total_tokens": getattr(usage, "total_tokens", 0),
    }


def normalize_model_id(model_id: str) -> str:
    return model_id.strip().lower()


def is_valid_model_id(model_id: str) -> bool:
    return bool(normalize_model_id(model_id))
