from __future__ import annotations

from typing import Any

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage


def normalize_deployment(model: str) -> str:
    return model.strip()


def message_to_dict(message: ChatMessage) -> dict[str, Any]:
    result: dict[str, Any] = {
        "role": message.role,
        "content": message.content,
    }

    if message.name:
        result["name"] = message.name

    if message.tool_call_id:
        result["tool_call_id"] = message.tool_call_id

    return result


def messages_to_payload(messages: list[ChatMessage]) -> list[dict[str, Any]]:
    return [message_to_dict(message) for message in messages]


def tool_to_payload(tool: Any) -> dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters,
        },
    }


def request_to_payload(request: ChatRequest) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "messages": messages_to_payload(request.messages),
    }

    if request.temperature is not None:
        payload["temperature"] = request.temperature

    if request.max_tokens is not None:
        payload["max_tokens"] = request.max_tokens

    if request.top_p is not None:
        payload["top_p"] = request.top_p

    if request.tools:
        payload["tools"] = [tool_to_payload(tool) for tool in request.tools]

    if request.tool_choice is not None:
        payload["tool_choice"] = request.tool_choice

    if request.response_format is not None:
        payload["response_format"] = request.response_format

    if request.stop is not None:
        payload["stop"] = request.stop

    if request.seed is not None:
        payload["seed"] = request.seed

    if request.stream:
        payload["stream"] = True

    return payload


def parse_usage(data: dict[str, Any]) -> ChatUsage:
    usage = data.get("usage") or {}

    input_tokens = int(
        usage.get("prompt_tokens", usage.get("input_tokens", 0)) or 0
    )
    output_tokens = int(
        usage.get("completion_tokens", usage.get("output_tokens", 0)) or 0
    )
    total_tokens = int(
        usage.get("total_tokens", input_tokens + output_tokens) or 0
    )

    return ChatUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        metadata=dict(usage),
    )


def parse_response(
    data: dict[str, Any],
    deployment: str,
    request_id: str | None = None,
    latency_ms: float | None = None,
) -> ChatResponse:
    choices = data.get("choices") or []
    choice = choices[0] if choices else {}

    message = choice.get("message") or {}
    content = message.get("content") or ""

    tool_calls = message.get("tool_calls") or []

    return ChatResponse(
        provider="azure_openai",
        model=deployment,
        content=content,
        usage=parse_usage(data),
        latency_ms=latency_ms,
        finish_reason=choice.get("finish_reason"),
        request_id=request_id or data.get("id"),
        tool_calls=tool_calls,
        raw_response=data,
        metadata={
            "object": data.get("object"),
            "system_fingerprint": data.get("system_fingerprint"),
        },
    )
