from __future__ import annotations

from typing import Any

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
)


def message_to_bedrock(
    message: ChatMessage,
) -> dict[str, Any]:
    content: list[dict[str, Any]] = []

    if isinstance(message.content, str):
        content.append(
            {
                "text": message.content,
            }
        )
    elif isinstance(message.content, list):
        for item in message.content:
            if isinstance(item, str):
                content.append({"text": item})
            elif isinstance(item, dict):
                content.append(item)
            else:
                content.append(
                    {"text": str(item)}
                )
    else:
        content.append(
            {
                "text": str(message.content),
            }
        )

    role = message.role

    if role == "system":
        role = "user"

    if role not in {"user", "assistant"}:
        role = "user"

    return {
        "role": role,
        "content": content,
    }


def request_to_converse_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    messages: list[dict[str, Any]] = []

    system_blocks: list[dict[str, str]] = []

    for message in request.messages:
        if message.role == "system":
            if isinstance(
                message.content,
                str,
            ):
                system_blocks.append(
                    {
                        "text": message.content,
                    }
                )
            else:
                system_blocks.append(
                    {
                        "text": str(
                            message.content
                        ),
                    }
                )
            continue

        messages.append(
            message_to_bedrock(message)
        )

    if not messages:
        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "text": "",
                    }
                ],
            }
        )

    inference_config: dict[str, Any] = {}

    if request.max_tokens is not None:
        inference_config["maxTokens"] = (
            request.max_tokens
        )

    if request.temperature is not None:
        inference_config["temperature"] = (
            request.temperature
        )

    if request.top_p is not None:
        inference_config["topP"] = request.top_p

    payload: dict[str, Any] = {
        "modelId": request.model,
        "messages": messages,
    }

    if system_blocks:
        payload["system"] = system_blocks

    if inference_config:
        payload["inferenceConfig"] = (
            inference_config
        )

    if request.stop:
        payload["inferenceConfig"][
            "stopSequences"
        ] = list(request.stop)

    if request.tools:
        tool_config = []

        for tool in request.tools:
            tool_config.append(
                {
                    "toolSpec": {
                        "name": tool.name,
                        "description": (
                            tool.description
                        ),
                        "inputSchema": {
                            "json": tool.parameters
                        },
                    }
                }
            )

        payload["toolConfig"] = {
            "tools": tool_config,
        }

    return payload


def parse_usage(
    usage: dict[str, Any] | None,
) -> ChatUsage:
    usage = usage or {}

    input_tokens = int(
        usage.get(
            "inputTokens",
            usage.get(
                "promptTokens",
                0,
            ),
        )
        or 0
    )

    output_tokens = int(
        usage.get(
            "outputTokens",
            usage.get(
                "completionTokens",
                0,
            ),
        )
        or 0
    )

    total_tokens = int(
        usage.get(
            "totalTokens",
            input_tokens + output_tokens,
        )
        or 0
    )

    return ChatUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        metadata=usage,
    )


def extract_response_text(
    response: dict[str, Any],
) -> str:
    output = response.get("output") or {}
    message = output.get("message") or {}

    content = message.get("content") or []

    parts: list[str] = []

    for block in content:
        if not isinstance(block, dict):
            continue

        text = block.get("text")

        if isinstance(text, str):
            parts.append(text)

    return "".join(parts)


def extract_tool_calls(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    output = response.get("output") or {}
    message = output.get("message") or {}

    content = message.get("content") or []

    tool_calls: list[dict[str, Any]] = []

    for block in content:
        if not isinstance(block, dict):
            continue

        tool_use = block.get("toolUse")

        if isinstance(tool_use, dict):
            tool_calls.append(tool_use)

    return tool_calls


def parse_response(
    response: dict[str, Any],
    model: str,
    request_id: str | None = None,
) -> ChatResponse:
    output = response.get("output") or {}

    message = output.get("message") or {}

    stop_reason = (
        response.get("stopReason")
        or response.get("finishReason")
    )

    usage = parse_usage(
        response.get("usage")
    )

    tool_calls = extract_tool_calls(
        response
    )

    return ChatResponse(
        provider="aws_bedrock",
        model=model,
        content=extract_response_text(
            response
        ),
        usage=usage,
        latency_ms=None,
        time_to_first_token_ms=None,
        finish_reason=stop_reason,
        request_id=request_id,
        tool_calls=tool_calls,
        raw_response=response,
        metadata={
            "output_role": message.get("role"),
            "metrics": response.get("metrics"),
        },
    )


def parse_model_summary(
    summary: dict[str, Any],
):
    from .models import model_from_bedrock_summary

    return model_from_bedrock_summary(
        summary
    )
