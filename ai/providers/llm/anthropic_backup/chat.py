@'
from __future__ import annotations

import time
from typing import Any

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage


class AnthropicChat:
    def __init__(self, client):
        self.client = client

    @staticmethod
    def _convert_messages(messages):
        system_parts = []
        converted = []

        for message in messages:
            role = getattr(message, "role", "user")
            content = getattr(message, "content", "")

            if not isinstance(content, str):
                content = str(content)

            if role == "system":
                system_parts.append(content)
                continue

            if role not in {"user", "assistant"}:
                role = "user"

            converted.append(
                {
                    "role": role,
                    "content": content,
                }
            )

        system = "\n\n".join(system_parts) or None
        return system, converted

    @staticmethod
    def _extract_content(response) -> str:
        parts = []

        for block in getattr(response, "content", []) or []:
            if getattr(block, "type", None) == "text":
                text = getattr(block, "text", "")
                if text:
                    parts.append(text)

        return "".join(parts)

    @staticmethod
    def _extract_tool_calls(response) -> list[dict[str, Any]]:
        calls = []

        for block in getattr(response, "content", []) or []:
            if getattr(block, "type", None) == "tool_use":
                calls.append(
                    {
                        "id": getattr(block, "id", None),
                        "name": getattr(block, "name", None),
                        "input": getattr(block, "input", {}),
                    }
                )

        return calls

    @staticmethod
    def _usage(response) -> ChatUsage:
        usage = getattr(response, "usage", None)

        input_tokens = int(
            getattr(usage, "input_tokens", 0) or 0
        )
        output_tokens = int(
            getattr(usage, "output_tokens", 0) or 0
        )

        return ChatUsage(
            prompt_tokens=input_tokens,
            completion_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
        )

    async def chat(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()

        system, messages = self._convert_messages(
            request.messages
        )

        payload = {
            "model": request.model,
            "max_tokens": request.max_tokens or 4096,
            "messages": messages,
        }

        if system:
            payload["system"] = system

        if request.tools:
            payload["tools"] = [
                tool.model_dump()
                if hasattr(tool, "model_dump")
                else tool
                for tool in request.tools
            ]

        if request.tool_choice is not None:
            payload["tool_choice"] = request.tool_choice

        if request.stop is not None:
            payload["stop_sequences"] = (
                [request.stop]
                if isinstance(request.stop, str)
                else request.stop
            )

        response = await self.client.request(
            method="POST",
            path="/messages",
            json=payload,
        )

        latency_ms = (
            time.perf_counter() - started
        ) * 1000.0

        return ChatResponse(
            provider="anthropic",
            model=request.model,
            content=self._extract_content(response),
            usage=self._usage(response),
            latency_ms=latency_ms,
            finish_reason=getattr(
                response,
                "stop_reason",
                None,
            ),
            request_id=(
                getattr(response, "id", None)
                or str(request.request_id)
            ),
            tool_calls=self._extract_tool_calls(response),
            raw_response=response,
        )


__all__ = ["AnthropicChat"]
'@ | Set-Content ".\ai\providers\llm\anthropic\chat.py"