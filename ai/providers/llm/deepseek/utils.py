from __future__ import annotations

import json
from typing import Any

from ...base.request import ChatRequest
from ...base.response import ChatUsage


def json_dumps(value: Any) -> str:
    """Serialize a value to compact JSON."""

    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )


def is_retryable_status(
    status_code: int,
) -> bool:
    """Return whether an HTTP status should normally be retried."""

    return (
        status_code == 408
        or status_code == 409
        or status_code == 429
        or status_code >= 500
    )


def build_chat_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    """Convert a ModelNow request to DeepSeek chat-completions format."""

    payload: dict[str, Any] = {
        "model": request.model,
        "messages": [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ],
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
        payload["seed"] = request.seed

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
    """Extract assistant content from a DeepSeek response."""

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

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []

        for item in content:
            if not isinstance(item, dict):
                continue

            text = item.get("text")

            if isinstance(text, str):
                parts.append(text)

        return "".join(parts)

    return ""


def extract_finish_reason(
    response: dict[str, Any],
) -> str | None:
    """Extract the normalized finish reason."""

    choices = response.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return None

    choice = choices[0]

    if not isinstance(choice, dict):
        return None

    reason = choice.get("finish_reason")

    if reason is None:
        return None

    return str(reason)


def extract_request_id(
    response: dict[str, Any],
) -> str | None:
    """Extract the DeepSeek response identifier."""

    request_id = response.get("id")

    if request_id is None:
        request_id = response.get("request_id")

    if request_id is None:
        return None

    return str(request_id)


def extract_tool_calls(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    """Extract tool calls from the first choice."""

    choices = response.get("choices", [])

    if not isinstance(choices, list) or not choices:
        return []

    choice = choices[0]

    if not isinstance(choice, dict):
        return []

    message = choice.get("message", {})

    if not isinstance(message, dict):
        return []

    tool_calls = message.get(
        "tool_calls",
        [],
    )

    if not isinstance(tool_calls, list):
        return []

    return [
        call
        for call in tool_calls
        if isinstance(call, dict)
    ]


def extract_usage(
    response: dict[str, Any],
) -> dict[str, Any]:
    """Extract normalized token usage."""

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
        usage.get("total_tokens"),
    )

    if total_tokens == 0:
        total_tokens = (
            input_tokens
            + output_tokens
        )

    reasoning_tokens = 0

    completion_details = usage.get(
        "completion_tokens_details"
    )

    if isinstance(
        completion_details,
        dict,
    ):
        reasoning_tokens = _first_int(
            completion_details.get(
                "reasoning_tokens"
            )
        )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost": 0.0,
        "cached_input_tokens": _first_int(
            usage.get("prompt_cache_hit_tokens"),
            usage.get("cached_input_tokens"),
        ),
        "reasoning_tokens": reasoning_tokens,
        "metadata": {
            "source": "deepseek",
            "raw_usage": usage,
        },
    }


def extract_stream_text(
    event: dict[str, Any],
) -> str:
    """Extract text from a DeepSeek streaming event."""

    choices = event.get("choices", [])

    if not isinstance(
        choices,
        list,
    ) or not choices:
        return ""

    choice = choices[0]

    if not isinstance(
        choice,
        dict,
    ):
        return ""

    delta = choice.get(
        "delta",
        {},
    )

    if not isinstance(
        delta,
        dict,
    ):
        return ""

    content = delta.get(
        "content",
        "",
    )

    if isinstance(
        content,
        str,
    ):
        return content

    if isinstance(
        content,
        list,
    ):
        parts: list[str] = []

        for item in content:
            if not isinstance(
                item,
                dict,
            ):
                continue

            text = item.get("text")

            if isinstance(
                text,
                str,
            ):
                parts.append(text)

        return "".join(parts)

    return ""


def extract_stream_finish_reason(
    event: dict[str, Any],
) -> str | None:
    """Extract finish reason from a streaming event."""

    choices = event.get(
        "choices",
        [],
    )

    if not isinstance(
        choices,
        list,
    ) or not choices:
        return None

    choice = choices[0]

    if not isinstance(
        choice,
        dict,
    ):
        return None

    reason = choice.get(
        "finish_reason"
    )

    if reason is None:
        return None

    return str(reason)


def extract_stream_usage(
    event: dict[str, Any],
) -> ChatUsage | None:
    """Extract usage from a streaming event."""

    usage = event.get("usage")

    if not isinstance(
        usage,
        dict,
    ):
        return None

    normalized = extract_usage(
        {
            "usage": usage
        }
    )

    return ChatUsage(
        input_tokens=normalized[
            "input_tokens"
        ],
        output_tokens=normalized[
            "output_tokens"
        ],
        total_tokens=normalized[
            "total_tokens"
        ],
        estimated_cost=normalized[
            "estimated_cost"
        ],
        cached_input_tokens=normalized[
            "cached_input_tokens"
        ],
        reasoning_tokens=normalized[
            "reasoning_tokens"
        ],
        metadata=normalized[
            "metadata"
        ],
    )


def _first_int(
    *values: Any,
) -> int:
    for value in values:
        if value is None:
            continue

        try:
            return int(value)
        except (
            TypeError,
            ValueError,
        ):
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
