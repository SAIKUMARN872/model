from __future__ import annotations

from typing import Any

from ...base.request import ChatRequest
from ...base.response import StreamChunk

from .client import DeepSeekClient


class DeepSeekStream:
    """DeepSeek streaming adapter."""

    def __init__(self, client: DeepSeekClient) -> None:
        self.client = client

    async def stream(
        self,
        request: ChatRequest,
    ):
        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        payload: dict[str, Any] = {
            "model": request.model,
            "messages": messages,
            "stream": True,
        }

        if request.temperature is not None:
            payload["temperature"] = request.temperature

        if request.max_tokens is not None:
            payload["max_tokens"] = request.max_tokens

        if request.top_p is not None:
            payload["top_p"] = request.top_p

        response = await self.client.stream_request(
            json=payload
        )

        async for chunk in response:
            choices = getattr(chunk, "choices", None) or []

            if not choices:
                continue

            choice = choices[0]
            delta = getattr(choice, "delta", None)

            content = ""
            if delta is not None:
                value = getattr(delta, "content", None)
                if value is not None:
                    content = value

            finish_reason = getattr(
                choice,
                "finish_reason",
                None,
            )

            yield StreamChunk(
                content=content,
                provider="deepseek",
                model=request.model,
                request_id=request.request_id,
                finish_reason=finish_reason,
                done=finish_reason is not None,
            )


__all__ = ["DeepSeekStream"]
