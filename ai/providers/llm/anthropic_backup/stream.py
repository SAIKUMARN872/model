@'
from __future__ import annotations

from typing import Any, AsyncIterator

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatUsage, StreamChunk


class AnthropicStream:
    def __init__(self, client):
        self.client = client

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:

        messages = []
        system_parts = []

        for message in request.messages:
            role = getattr(message, "role", "user")
            content = getattr(message, "content", "")

            if not isinstance(content, str):
                content = str(content)

            if role == "system":
                system_parts.append(content)
                continue

            if role not in {"user", "assistant"}:
                role = "user"

            messages.append(
                {
                    "role": role,
                    "content": content,
                }
            )

        payload: dict[str, Any] = {
            "model": request.model,
            "max_tokens": request.max_tokens or 4096,
            "messages": messages,
        }

        if system_parts:
            payload["system"] = "\n\n".join(system_parts)

        if request.tools:
            payload["tools"] = [
                tool.model_dump()
                if hasattr(tool, "model_dump")
                else tool
                for tool in request.tools
            ]

        async with self.client.stream_request(
            json=payload
        ) as stream:

            async for event in stream:
                event_type = getattr(
                    event,
                    "type",
                    None,
                )

                if event_type == "content_block_delta":
                    delta = getattr(
                        event,
                        "delta",
                        None,
                    )

                    if getattr(
                        delta,
                        "type",
                        None,
                    ) == "text_delta":

                        text = getattr(
                            delta,
                            "text",
                            "",
                        )

                        if text:
                            yield StreamChunk(
                                content=text,
                                provider="anthropic",
                                model=request.model,
                                request_id=str(
                                    request.request_id
                                ),
                            )

                elif event_type == "message_delta":
                    delta = getattr(
                        event,
                        "delta",
                        None,
                    )

                    usage = getattr(
                        event,
                        "usage",
                        None,
                    )

                    output_tokens = int(
                        getattr(
                            usage,
                            "output_tokens",
                            0,
                        )
                        or 0
                    )

                    yield StreamChunk(
                        provider="anthropic",
                        model=request.model,
                        request_id=str(
                            request.request_id
                        ),
                        finish_reason=getattr(
                            delta,
                            "stop_reason",
                            None,
                        ),
                        usage=ChatUsage(
                            prompt_tokens=0,
                            completion_tokens=output_tokens,
                            total_tokens=output_tokens,
                        ),
                    )

                elif event_type == "message_stop":
                    yield StreamChunk(
                        provider="anthropic",
                        model=request.model,
                        request_id=str(
                            request.request_id
                        ),
                        done=True,
                    )


__all__ = ["AnthropicStream"]
'@ | Set-Content ".\ai\providers\llm\anthropic\stream.py"