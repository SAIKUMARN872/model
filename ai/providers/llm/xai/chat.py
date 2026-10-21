from __future__ import annotations

from typing import Any

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage

from .client import XAIClient
from .config import XAIConfig


class XAIChat:
    def __init__(
        self,
        client: XAIClient,
        config: XAIConfig,
    ):
        self.client = client
        self.config = config

    def build_payload(
        self,
        request: ChatRequest,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": request.model or self.config.default_model,
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

        if request.user is not None:
            payload["user"] = request.user

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

    async def create(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        payload = self.build_payload(request)
        data = await self.client.request(payload)

        return self.parse_response(data)

    def parse_response(
        self,
        data: dict[str, Any],
    ) -> ChatResponse:
        choices = data.get("choices") or []

        content = ""
        finish_reason = None
        tool_calls = []

        if choices:
            choice = choices[0]
            finish_reason = choice.get("finish_reason")

            message = choice.get("message") or {}
            content = message.get("content") or ""
            tool_calls = message.get("tool_calls") or []

        usage_data = data.get("usage") or {}

        usage = ChatUsage(
            input_tokens=int(
                usage_data.get("prompt_tokens")
                or usage_data.get("input_tokens")
                or 0
            ),
            output_tokens=int(
                usage_data.get("completion_tokens")
                or usage_data.get("output_tokens")
                or 0
            ),
            total_tokens=int(
                usage_data.get("total_tokens")
                or 0
            ),
            metadata=usage_data,
        )

        return ChatResponse(
            provider="xai",
            model=data.get("model"),
            content=content,
            usage=usage,
            finish_reason=finish_reason,
            request_id=data.get("id"),
            tool_calls=tool_calls,
            raw_response=data,
        )
