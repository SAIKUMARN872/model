from __future__ import annotations

import json
from typing import Any

from ...base.request import ChatRequest
from ...base.response import ChatUsage


def json_dumps(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )


def is_retryable_status(status_code: int) -> bool:
    return (
        status_code == 408
        or status_code == 409
        or status_code == 429
        or status_code >= 500
    )


def build_chat_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    messages: list[dict[str, Any]] = []

    for message in request.messages:
        role = message.role.strip().lower()

        if role not in {
            "system",
            "user",
            "assistant",
            "tool",
        }:
            role = "user"

        item: dict[str, Any] = {
            "role": role,
            "content": message.content,
        }

        if message.name:
            item["name"] = message.name

        if message.tool_call_id:
            item["tool_call_id"] = message.tool_call_id

        messages.append(item)

    payload: dict[str, Any] = {
        "model": request.model,
        "messages": messages,
    }

    if request.temperature is not None:
        payload["temperature"] = request.temperature

    if request.max_tokens is not None:
        payload["max_tokens"] = request.max_tokens

    if request.top_p is not None:
        payload["top_p"] = request.top_p

    if request.stream:
        payload["stream"] = True

    if request.stop is not None:
        payload["stop"] = request.stop

    if request.seed is not None:
        payload["random_seed"] = request.seed

    if request.tools:
        payload["tools"] = [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                },
            }
            for tool in request.tools
        ]

    if request.tool_choice is not None:
        payload["tool_choice"] = request.tool_choice

    if request.response_format is not None:
        payload["response_format"] = request.response_format

    return payload


def extract_content(
    response: dict[str, Any],
) -> str:
    choices = response.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return ""

    choice = choices[0]

    if not isinstance(choice, dict):
        return ""

    message = choice.get("message", {})

    if not isinstance(message, dict):
        return ""

    content = message.get("content", "")

    return content if isinstance(content, str) else ""


def extract_finish_reason(
    response: dict[str, Any],
) -> str | None:
    choices = response.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return None

    choice = choices[0]

    if not isinstance(choice, dict):
        return None

    reason = choice.get("finish_reason")

    return None if reason is None else str(reason)


def extract_request_id(
    response: dict[str, Any],
) -> str | None:
    request_id = response.get("id")

    return (
        None
        if request_id is None
        else str(request_id)
    )


def extract_tool_calls(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    choices = response.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return []

    choice = choices[0]

    if not isinstance(choice, dict):
        return []

    message = choice.get("message", {})

    if not isinstance(message, dict):
        return []

    tool_calls = message.get("tool_calls", [])

    if not isinstance(tool_calls, list):
        return []

    return [
        item
        for item in tool_calls
        if isinstance(item, dict)
    ]


def extract_usage(
    response: dict[str, Any],
) -> dict[str, Any]:
    usage = response.get("usage", {})

    if not isinstance(usage, dict):
        usage = {}

    input_tokens = _first_int(
        usage.get("prompt_tokens"),
        usage.get("input_tokens"),
    )

    output_tokens = _first_int(
        usage.get("completion_tokens"),
        usage.get("output_tokens"),
    )

    total_tokens = _first_int(
        usage.get("total_tokens")
    )

    if total_tokens == 0:
        total_tokens = (
            input_tokens + output_tokens
        )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost": 0.0,
        "cached_input_tokens": 0,
        "reasoning_tokens": 0,
        "metadata": {
            "source": "mistral",
            "raw_usage": usage,
        },
    }


def extract_stream_text(
    event: dict[str, Any],
) -> str:
    choices = event.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return ""

    choice = choices[0]

    if not isinstance(choice, dict):
        return ""

    delta = choice.get("delta", {})

    if not isinstance(delta, dict):
        return ""

    content = delta.get("content", "")

    return content if isinstance(content, str) else ""


def extract_stream_finish_reason(
    event: dict[str, Any],
) -> str | None:
    choices = event.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return None

    choice = choices[0]

    if not isinstance(choice, dict):
        return None

    reason = choice.get("finish_reason")

    return None if reason is None else str(reason)


def extract_stream_usage(
    event: dict[str, Any],
) -> ChatUsage | None:
    usage = event.get("usage")

    if not isinstance(usage, dict):
        return None

    normalized = extract_usage(
        {"usage": usage}
    )

    return ChatUsage(
        input_tokens=normalized["input_tokens"],
        output_tokens=normalized["output_tokens"],
        total_tokens=normalized["total_tokens"],
        estimated_cost=normalized["estimated_cost"],
        cached_input_tokens=normalized[
            "cached_input_tokens"
        ],
        reasoning_tokens=normalized[
            "reasoning_tokens"
        ],
        metadata=normalized["metadata"],
    )


def _first_int(*values: Any) -> int:
    for value in values:
        if value is None:
            continue

        try:
            return int(value)
        except (TypeError, ValueError):
            continue

    return 0


__all__ = [
    "build_chat_payload",
    "extract_content",
    "extract_finish_reason",
    "extract_request_id",
    "extract_stream_finish_reason",
    "extract_stream_text",
    "extract_stream_usage",
    "extract_tool_calls",
    "extract_usage",
    "is_retryable_status",
    "json_dumps",
]
