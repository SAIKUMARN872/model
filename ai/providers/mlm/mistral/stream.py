from __future__ import annotations

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import StreamChunk

from .client import MistralClient


class MistralStream:
    def __init__(self, client: MistralClient) -> None:
        self.client = client

    async def stream(self, request: ChatRequest):
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
            "stream": True,
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

        events = await self.client.raw_client.chat.stream_async(**kwargs)

        async for event in events:
            data = getattr(event, "data", None)
            if data is None:
                continue

            content = getattr(data, "content", "") or ""
            finish_reason = getattr(data, "finish_reason", None)

            yield StreamChunk(
                content=content,
                provider="mistral",
                model=request.model,
                request_id=request.request_id,
                finish_reason=finish_reason,
                done=finish_reason is not None,
                metadata={"transport": "mistral_sdk"},
            )
