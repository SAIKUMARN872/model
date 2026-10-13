from __future__ import annotations

import time

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage

from .client import MistralClient


class MistralChat:
    def __init__(self, client: MistralClient) -> None:
        self.client = client

    async def complete(self, request: ChatRequest) -> ChatResponse:
        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        kwargs: dict[str, object] = {
            "model": request.model,
            "messages": messages,
        }

        if request.temperature is not None:
            kwargs["temperature"] = request.temperature
        if request.top_p is not None:
            kwargs["top_p"] = request.top_p
        if request.max_tokens is not None:
            kwargs["max_tokens"] = request.max_tokens
        if request.stop is not None:
            kwargs["stop"] = request.stop
        if request.seed is not None:
            kwargs["random_seed"] = request.seed

        if request.tools:
            kwargs["tools"] = [
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
            kwargs["tool_choice"] = request.tool_choice

        started = time.perf_counter()
        response = await self.client.raw_client.chat.complete_async(**kwargs)
        latency_ms = (time.perf_counter() - started) * 1000.0

        content = ""
        finish_reason = None
        tool_calls = []

        if response.choices:
            choice = response.choices[0]
            finish_reason = choice.finish_reason
            if choice.message is not None:
                content = choice.message.content or ""
                tool_calls = choice.message.tool_calls or []

        usage = ChatUsage(
            input_tokens=getattr(response.usage, "prompt_tokens", 0),
            output_tokens=getattr(response.usage, "completion_tokens", 0),
            total_tokens=getattr(response.usage, "total_tokens", 0),
        )

        return ChatResponse(
            provider="mistral",
            model=request.model,
            content=content,
            usage=usage,
            latency_ms=latency_ms,
            finish_reason=finish_reason,
            request_id=request.request_id,
            tool_calls=tool_calls,
            raw_response=response,
            metadata={"transport": "mistral_sdk"},
        )
