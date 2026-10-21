from __future__ import annotations

from typing import Any


def build_messages(
    messages: list[Any],
) -> list[dict[str, Any]]:
    """Convert ModelNow messages into API-compatible dictionaries."""
    result: list[dict[str, Any]] = []

    for message in messages:
        if isinstance(message, dict):
            result.append(dict(message))
            continue

        role = getattr(message, "role", "user")
        content = getattr(message, "content", "")

        item: dict[str, Any] = {
            "role": role,
            "content": content,
        }

        name = getattr(message, "name", None)
        if name is not None:
            item["name"] = name

        tool_call_id = getattr(message, "tool_call_id", None)
        if tool_call_id is not None:
            item["tool_call_id"] = tool_call_id

        result.append(item)

    return result


def build_tool_payload(tools: list[Any] | None) -> list[dict[str, Any]]:
    """Convert ModelNow tool definitions to OpenAI-compatible format."""
    if not tools:
        return []

    result: list[dict[str, Any]] = []

    for tool in tools:
        if isinstance(tool, dict):
            result.append(dict(tool))
            continue

        result.append(
            {
                "type": "function",
                "function": {
                    "name": getattr(tool, "name", ""),
                    "description": getattr(tool, "description", ""),
                    "parameters": getattr(tool, "parameters", {}),
                },
            }
        )

    return result


def extract_content(response: Any) -> str:
    """Safely extract assistant text from an API response."""
    choices = getattr(response, "choices", None) or []
    if not choices:
        return ""

    message = getattr(choices[0], "message", None)
    if message is None:
        return ""

    content = getattr(message, "content", None)
    return content if isinstance(content, str) else ""


def extract_usage(response: Any) -> dict[str, int]:
    """Normalize provider usage information."""
    usage = getattr(response, "usage", None)
    if usage is None:
        return {
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
        }

    input_tokens = int(
        getattr(usage, "prompt_tokens", 0) or 0
    )
    output_tokens = int(
        getattr(usage, "completion_tokens", 0) or 0
    )

    total_tokens = int(
        getattr(
            usage,
            "total_tokens",
            input_tokens + output_tokens,
        )
        or input_tokens + output_tokens
    )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
    }


def normalize_model_id(model_id: str) -> str:
    """Normalize a DeepSeek model identifier."""
    return model_id.strip()


def is_valid_model_id(model_id: str) -> bool:
    """Return whether a model identifier is non-empty."""
    return bool(normalize_model_id(model_id))


__all__ = [
    "build_messages",
    "build_tool_payload",
    "extract_content",
    "extract_usage",
    "normalize_model_id",
    "is_valid_model_id",
]
