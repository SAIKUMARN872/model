cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from __future__ import annotations

from typing import Any

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage


def _message_to_bedrock(message: Any) -> tuple[str, dict[str, Any]]:
    """
    Convert a ModelNow ChatMessage into an Amazon Bedrock Converse message.
    """

    role = getattr(message, "role", "user")
    content = getattr(message, "content", "")

    if role == "system":
        raise ValueError("System messages must be handled separately.")

    if role not in {"user", "assistant"}:
        role = "user"

    return role, {
        "content": [
            {
                "text": str(content),
            }
        ]
    }


def build_converse_payload(request: ChatRequest) -> dict[str, Any]:
    """
    Convert normalized ModelNow ChatRequest into
    Amazon Bedrock Converse API payload.
    """

    messages: list[dict[str, Any]] = []
    system_blocks: list[dict[str, Any]] = []

    for message in request.messages:
        role = getattr(message, "role", "user")
        content = getattr(message, "content", "")

        if role == "system":
            system_blocks.append(
                {
                    "text": str(content),
                }
            )
            continue

        normalized_role, bedrock_message = _message_to_bedrock(message)

        messages.append(
            {
                "role": normalized_role,
                "content": bedrock_message["content"],
            }
        )

    payload: dict[str, Any] = {
        "modelId": request.model,
        "messages": messages,
    }

    if system_blocks:
        payload["system"] = system_blocks

    inference_config: dict[str, Any] = {}

    if request.temperature is not None:
        inference_config["temperature"] = request.temperature

    if request.max_tokens is not None:
        inference_config["maxTokens"] = request.max_tokens

    if request.top_p is not None:
        inference_config["topP"] = request.top_p

    if request.stop is not None:
        if isinstance(request.stop, str):
            inference_config["stopSequences"] = [request.stop]
        else:
            inference_config["stopSequences"] = list(request.stop)

    if inference_config:
        payload["inferenceConfig"] = inference_config

    if request.tools:
        tool_specs = []

        for tool in request.tools:
            tool_specs.append(
                {
                    "toolSpec": {
                        "name": tool.name,
                        "description": tool.description,
                        "inputSchema": {
                            "json": tool.parameters,
                        },
                    }
                }
            )

        payload["toolConfig"] = {
            "tools": tool_specs,
        }

        if request.tool_choice is not None:
            if isinstance(request.tool_choice, str):
                if request.tool_choice == "auto":
                    payload["toolConfig"]["toolChoice"] = {
                        "auto": {}
                    }
                elif request.tool_choice == "any":
                    payload["toolConfig"]["toolChoice"] = {
                        "any": {}
                    }
                else:
                    payload["toolConfig"]["toolChoice"] = {
                        "tool": {
                            "name": request.tool_choice,
                        }
                    }
            elif isinstance(request.tool_choice, dict):
                payload["toolConfig"]["toolChoice"] = request.tool_choice

    return payload


def parse_converse_response(
    response: dict[str, Any],
    *,
    provider: str = "aws_bedrock",
    request_id: str | None = None,
) -> ChatResponse:
    """
    Convert Amazon Bedrock Converse response into
    normalized ModelNow ChatResponse.
    """

    output = response.get("output", {})
    message = output.get("message", {})

    content_parts = message.get("content", [])

    text_parts: list[str] = []
    tool_calls: list[dict[str, Any]] = []

    for part in content_parts:
        if "text" in part:
            text_parts.append(str(part["text"]))

        if "toolUse" in part:
            tool_use = part["toolUse"]

            tool_calls.append(
                {
                    "id": tool_use.get("toolUseId"),
                    "name": tool_use.get("name"),
                    "input": tool_use.get("input", {}),
                }
            )

    usage_data = response.get("usage", {})

    input_tokens = int(
        usage_data.get("inputTokens", 0)
    )

    output_tokens = int(
        usage_data.get("outputTokens", 0)
    )

    total_tokens = int(
        usage_data.get(
            "totalTokens",
            input_tokens + output_tokens,
        )
    )

    usage = ChatUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        metadata={
            "cache_read_input_tokens": usage_data.get(
                "cacheReadInputTokens",
                0,
            ),
            "cache_write_input_tokens": usage_data.get(
                "cacheWriteInputTokens",
                0,
            ),
        },
    )

    return ChatResponse(
        provider=provider,
        model=response.get(
            "modelId",
            "",
        ),
        content="".join(text_parts),
        usage=usage,
        finish_reason=response.get(
            "stopReason"
        ),
        request_id=request_id,
        tool_calls=tool_calls,
        raw_response=response,
        metadata={
            "response_metadata": response.get(
                "ResponseMetadata",
                {}
            )
        },
    )


__all__ = [
    "build_converse_payload",
    "parse_converse_response",
]
'@ | Set-Content ".\ai\providers\llm\aws_bedrock\chat.py"