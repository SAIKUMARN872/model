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
    if response is None:
        return ""

    if isinstance(response, str):
        return response

    if isinstance(response, dict):
        if "content" in response:
            return str(response.get("content") or "")

        choices = response.get("choices") or []
        if choices:
            choice = choices[0]
            if isinstance(choice, dict):
                message = choice.get("message") or {}
                if isinstance(message, dict):
                    return str(message.get("content") or "")
                return str(getattr(message, "content", "") or "")

    choices = getattr(response, "choices", None) or []
    if choices:
        choice = choices[0]
        message = getattr(choice, "message", None)
        if message is not None:
            return str(getattr(message, "content", "") or "")

    return str(getattr(response, "content", "") or "")


def normalize_model_id(model_id: str) -> str:
    return model_id.strip().lower()


def is_valid_model_id(model_id: str) -> bool:
    return bool(normalize_model_id(model_id))


def merge_metadata(
    base: dict[str, Any] | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    result = dict(base or {})
    result.update(extra or {})
    return result


def extract_usage(response: Any) -> dict[str, int]:
    usage = getattr(response, "usage", None)

    if usage is None and isinstance(response, dict):
        usage = response.get("usage")

    if usage is None:
        return {
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
        }

    if isinstance(usage, dict):
        input_tokens = usage.get("prompt_tokens", usage.get("input_tokens", 0))
        output_tokens = usage.get("completion_tokens", usage.get("output_tokens", 0))
        total_tokens = usage.get("total_tokens", 0)
    else:
        input_tokens = getattr(
            usage,
            "prompt_tokens",
            getattr(usage, "input_tokens", 0),
        )
        output_tokens = getattr(
            usage,
            "completion_tokens",
            getattr(usage, "output_tokens", 0),
        )
        total_tokens = getattr(usage, "total_tokens", 0)

    if not total_tokens:
        total_tokens = input_tokens + output_tokens

    return {
        "input_tokens": int(input_tokens or 0),
        "output_tokens": int(output_tokens or 0),
        "total_tokens": int(total_tokens or 0),
    }
