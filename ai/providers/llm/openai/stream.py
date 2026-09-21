from __future__ import annotations

from typing import Any, AsyncIterator

from ...base.request import ChatRequest
from ...base.response import StreamChunk

from .client import OpenAIClient


class OpenAIStream:
    """OpenAI Responses API streaming adapter."""

    PROVIDER_ID = "openai"

    def __init__(self, client: OpenAIClient) -> None:
        self.client = client

    @staticmethod
    def _message_to_dict(message: Any) -> dict[str, Any]:
        if isinstance(message, dict):
            return dict(message)

        return {
            "role": getattr(message, "role", "user"),
            "content": getattr(message, "content", ""),
        }

    def _build_payload(self, request: ChatRequest) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": request.model,
            "input": [
                self._message_to_dict(message)
                for message in request.messages
            ],
            "stream": True,
        }

        if request.temperature is not None:
            payload["temperature"] = request.temperature

        if request.max_tokens is not None:
            payload["max_output_tokens"] = request.max_tokens

        if request.top_p is not None:
            payload["top_p"] = request.top_p

        if request.tools:
            payload["tools"] = [
                tool.model_dump(exclude_none=True)
                if hasattr(tool, "model_dump")
                else (
                    tool
                    if isinstance(tool, dict)
                    else {}
                )
                for tool in request.tools
            ]

        if request.tool_choice is not None:
            payload["tool_choice"] = request.tool_choice

        return payload

    @staticmethod
    def _event_text(event: Any) -> str:
        event_type = getattr(event, "type", "")

        if event_type == "response.output_text.delta":
            return str(
                getattr(event, "delta", "") or ""
            )

        return ""

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        payload = self._build_payload(request)

        response_stream = await self.client.request(
            method="POST",
            path="/responses",
            json=payload,
        )

        response_id: str | None = None

        async for event in response_stream:
            event_type = getattr(event, "type", "")

            if event_type == "response.created":
                response = getattr(event, "response", None)
                response_id = getattr(response, "id", None)

            text = self._event_text(event)

            if text:
                yield StreamChunk(
                    content=text,
                    provider=self.PROVIDER_ID,
                    model=request.model,
                    request_id=response_id
                    or str(request.request_id),
                    done=False,
                )

            if event_type == "response.completed":
                response = getattr(event, "response", None)
                usage = getattr(response, "usage", None)

                yield StreamChunk(
                    content="",
                    provider=self.PROVIDER_ID,
                    model=request.model,
                    request_id=response_id
                    or str(request.request_id),
                    usage=self._usage(usage),
                    finish_reason="completed",
                    done=True,
                )

    @staticmethod
    def _usage(usage: Any) -> Any:
        if usage is None:
            return None

        from ...base.response import ChatUsage

        input_tokens = int(
            getattr(usage, "input_tokens", 0) or 0
        )
        output_tokens = int(
            getattr(usage, "output_tokens", 0) or 0
        )
        total_tokens = int(
            getattr(usage, "total_tokens", 0)
            or input_tokens + output_tokens
        )

        return ChatUsage(
            input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        )


__all__ = ["OpenAIStream"]





