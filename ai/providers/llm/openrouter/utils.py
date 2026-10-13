from __future__ import annotations

from typing import Any

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
)

from .models import OpenRouterModel


def _message_to_dict(message) -> dict[str, Any]:
    data: dict[str, Any] = {
        "role": message.role,
        "content": message.content,
    }

    if message.name is not None:
        data["name"] = message.name

    if message.tool_call_id is not None:
        data["tool_call_id"] = message.tool_call_id

    return data


def request_to_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": request.model,
        "messages": [
            _message_to_dict(message)
            for message in request.messages
        ],
        "stream": request.stream,
    }

    if request.temperature is not None:
        payload["temperature"] = request.temperature

    if request.max_tokens is not None:
        payload["max_tokens"] = request.max_tokens

    if request.top_p is not None:
        payload["top_p"] = request.top_p

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

    if request.stop is not None:
        payload["stop"] = request.stop

    if request.seed is not None:
        payload["seed"] = request.seed

    return payload


def _parse_usage(
    usage: dict[str, Any] | None,
) -> ChatUsage:
    usage = usage or {}

    input_tokens = int(
        usage.get(
            "prompt_tokens",
            usage.get("input_tokens", 0),
        )
        or 0
    )

    output_tokens = int(
        usage.get(
            "completion_tokens",
            usage.get("output_tokens", 0),
        )
        or 0
    )

    total_tokens = int(
        usage.get(
            "total_tokens",
            input_tokens + output_tokens,
        )
        or 0
    )

    reasoning_tokens = int(
        usage.get("reasoning_tokens", 0)
        or 0
    )

    cost = usage.get("cost", 0.0)

    return ChatUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        estimated_cost=float(cost or 0.0),
        reasoning_tokens=reasoning_tokens,
        metadata=usage,
    )


def parse_response(
    data: dict[str, Any],
    deployment: str,
) -> ChatResponse:
    choices = data.get("choices") or []

    if not choices:
        raise ValueError(
            "OpenRouter response does not contain choices"
        )

    choice = choices[0]

    message = choice.get("message") or {}

    content = message.get("content") or ""

    tool_calls = message.get("tool_calls") or []

    usage = _parse_usage(data.get("usage"))

    return ChatResponse(
        provider="openrouter",
        model=(
            data.get("model")
            or deployment
        ),
        content=content,
        usage=usage,
        finish_reason=choice.get("finish_reason"),
        request_id=data.get("id"),
        tool_calls=tool_calls,
        raw_response=data,
        metadata={
            "object": data.get("object"),
            "system_fingerprint": data.get(
                "system_fingerprint"
            ),
        },
    )


def parse_model(
    data: dict[str, Any],
) -> OpenRouterModel:
    pricing = data.get("pricing") or {}

    def price_per_million(
        key: str,
    ) -> float:
        value = pricing.get(key, 0)

        try:
            return float(value) * 1_000_000
        except (TypeError, ValueError):
            return 0.0

    top_provider = data.get("top_provider") or {}

    max_completion_tokens = int(
        top_provider.get(
            "max_completion_tokens",
            data.get("max_completion_tokens", 0),
        )
        or 0
    )

    supported_parameters = tuple(
        str(value)
        for value in (
            data.get("supported_parameters") or []
        )
    )

    return OpenRouterModel(
        id=str(data.get("id", "")),
        name=str(data.get("name", "")),
        context_length=int(
            data.get("context_length", 0) or 0
        ),
        max_output_tokens=max_completion_tokens,
        input_cost_per_1m_tokens=price_per_million(
            "prompt"
        ),
        output_cost_per_1m_tokens=price_per_million(
            "completion"
        ),
        architecture=dict(
            data.get("architecture") or {}
        ),
        top_provider=dict(top_provider),
        supported_parameters=supported_parameters,
        metadata={
            "created": data.get("created"),
            "canonical_slug": data.get(
                "canonical_slug"
            ),
            "hugging_face_id": data.get(
                "hugging_face_id"
            ),
        },
    )
