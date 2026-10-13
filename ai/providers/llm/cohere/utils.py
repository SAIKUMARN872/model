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


def is_retryable_status(status_code: int) -> bool:
    """Return whether an HTTP status should normally be retried."""

    return status_code == 408 or status_code == 409 or status_code == 429 or status_code >= 500


def build_chat_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    """Convert a normalized ModelNow request to Cohere v2 chat format."""

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
        payload["p"] = request.top_p

    if request.stop is not None:
        payload["stop_sequences"] = (
            [request.stop]
            if isinstance(request.stop, str)
            else request.stop
        )

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

    return payload


def extract_content(
    response: dict[str, Any],
) -> str:
    """Extract assistant text from a Cohere response."""

    message = response.get("message", {})

    content = (
        message.get("content", "")
        if isinstance(message, dict)
        else ""
    )

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        return _extract_text_list(content)

    return ""


def extract_finish_reason(
    response: dict[str, Any],
) -> str | None:
    """Extract the normalized finish reason."""

    finish_reason = response.get("finish_reason")

    if finish_reason is None:
        message = response.get("message", {})

        if isinstance(message, dict):
            finish_reason = message.get(
                "finish_reason"
            )

    if finish_reason is None:
        return None

    return str(finish_reason)


def extract_request_id(
    response: dict[str, Any],
) -> str | None:
    """Extract the Cohere request/response identifier."""

    request_id = response.get("id")

    if request_id is None:
        request_id = response.get("request_id")

    if request_id is None:
        return None

    return str(request_id)


def extract_tool_calls(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    """Extract tool calls from a Cohere response."""

    message = response.get("message", {})

    if not isinstance(message, dict):
        return []

    tool_calls = message.get("tool_calls", [])

    if not isinstance(tool_calls, list):
        return []

    return [
        call
        for call in tool_calls
        if isinstance(call, dict)
    ]


def extract_citations(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    """Extract citations from a Cohere response."""

    message = response.get("message", {})

    if isinstance(message, dict):
        citations = message.get("citations")

        if isinstance(citations, list):
            return [
                citation
                for citation in citations
                if isinstance(citation, dict)
            ]

    citations = response.get("citations")

    if isinstance(citations, list):
        return [
            citation
            for citation in citations
            if isinstance(citation, dict)
        ]

    return []


def extract_usage(
    response: dict[str, Any],
) -> dict[str, Any]:
    """Extract normalized token usage from a Cohere response."""

    usage = response.get("usage", {})

    if not isinstance(usage, dict):
        usage = {}

    billed_units = usage.get(
        "billed_units",
        {},
    )

    if not isinstance(billed_units, dict):
        billed_units = {}

    input_tokens = _first_int(
        billed_units.get("input_tokens"),
        usage.get("input_tokens"),
        usage.get("prompt_tokens"),
    )

    output_tokens = _first_int(
        billed_units.get("output_tokens"),
        usage.get("output_tokens"),
        usage.get("completion_tokens"),
    )

    total_tokens = _first_int(
        usage.get("total_tokens"),
    )

    if total_tokens == 0:
        total_tokens = (
            input_tokens
            + output_tokens
        )

    cached_input_tokens = _first_int(
        billed_units.get("cached_input_tokens"),
        usage.get("cached_input_tokens"),
    )

    reasoning_tokens = _first_int(
        billed_units.get("reasoning_tokens"),
        usage.get("reasoning_tokens"),
    )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost": 0.0,
        "cached_input_tokens": cached_input_tokens,
        "reasoning_tokens": reasoning_tokens,
        "metadata": {
            "source": "cohere",
            "raw_usage": usage,
        },
    }


def extract_stream_text(
    event: dict[str, Any],
) -> str:
    """Extract text from a Cohere streaming event."""

    delta = event.get("delta")

    if isinstance(delta, dict):
        message = delta.get("message")

        if isinstance(message, dict):
            content = message.get("content")

            if isinstance(content, str):
                return content

            if isinstance(content, list):
                return _extract_text_list(content)

        content = delta.get("content")

        if isinstance(content, str):
            return content

        if isinstance(content, dict):
            text = content.get("text")

            if isinstance(text, str):
                return text

    text = event.get("text")

    if isinstance(text, str):
        return text

    return ""


def extract_stream_finish_reason(
    event: dict[str, Any],
) -> str | None:
    """Extract finish reason from a Cohere stream event."""

    finish_reason = event.get("finish_reason")

    if finish_reason is not None:
        return str(finish_reason)

    delta = event.get("delta")

    if isinstance(delta, dict):
        finish_reason = delta.get(
            "finish_reason"
        )

        if finish_reason is not None:
            return str(finish_reason)

    return None


def extract_stream_usage(
    event: dict[str, Any],
) -> ChatUsage | None:
    """Extract usage from a Cohere stream event."""

    usage_data = event.get("usage")

    if not isinstance(usage_data, dict):
        delta = event.get("delta")

        if isinstance(delta, dict):
            usage_data = delta.get("usage")

    if not isinstance(usage_data, dict):
        return None

    normalized = extract_usage(
        {
            "usage": usage_data
        }
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


def _extract_text_list(
    content: list[Any],
) -> str:
    parts: list[str] = []

    for item in content:
        if not isinstance(item, dict):
            continue

        text = item.get("text")

        if isinstance(text, str):
            parts.append(text)

    return "".join(parts)


def _first_int(
    *values: Any,
) -> int:
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
    "extract_citations",
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
