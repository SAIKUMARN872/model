from __future__ import annotations

import time

from ...base.request import ChatRequest
from ...base.response import ChatResponse, ChatUsage

from .client import DeepSeekClient


class DeepSeekChat:
    """DeepSeek chat completion adapter."""

    def __init__(self, client: DeepSeekClient) -> None:
        self.client = client

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        payload: dict = {
            "model": request.model,
            "messages": messages,
            "stream": False,
        }

        if request.temperature is not None:
            payload["temperature"] = request.temperature

        if request.max_tokens is not None:
            payload["max_tokens"] = request.max_tokens

        if request.top_p is not None:
            payload["top_p"] = request.top_p

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

        started = time.perf_counter()
        raw = await self.client.request(
            method="POST",
            path="/chat/completions",
            json=payload,
        )
        latency_ms = (time.perf_counter() - started) * 1000.0

        choice = raw.choices[0] if raw.choices else None
        message = choice.message if choice is not None else None

        content = ""
        if message is not None and message.content is not None:
            content = message.content

        usage_data = getattr(raw, "usage", None)
        usage = ChatUsage()

        if usage_data is not None:
            input_tokens = getattr(
                usage_data,
                "prompt_tokens",
                0,
            ) or 0
            output_tokens = getattr(
                usage_data,
                "completion_tokens",
                0,
            ) or 0
            usage = ChatUsage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )

        finish_reason = None
        if choice is not None:
            finish_reason = getattr(
                choice,
                "finish_reason",
                None,
            )

        return ChatResponse(
            provider="deepseek",
            model=request.model,
            content=content,
            usage=usage,
            latency_ms=latency_ms,
            finish_reason=finish_reason,
            request_id=request.request_id,
            raw_response=raw,
            metadata={
                "transport": "openai_compatible",
            },
        )


__all__ = ["DeepSeekChat"]
