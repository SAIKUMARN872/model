from __future__ import annotations

import json
from typing import Any, AsyncIterator

from ai.providers.base.response import StreamChunk


class XAIStreamParser:
    def __init__(
        self,
        provider: str = "xai",
        model: str | None = None,
        request_id: str | None = None,
    ):
        self.provider = provider
        self.model = model
        self.request_id = request_id

    def parse_line(
        self,
        line: str,
    ) -> StreamChunk | None:
        line = line.strip()

        if not line:
            return None

        if line.startswith(":"):
            return None

        if line.startswith("data:"):
            line = line[5:].strip()

        if line == "[DONE]":
            return StreamChunk(
                provider=self.provider,
                model=self.model,
                request_id=self.request_id,
                done=True,
                finish_reason="stop",
            )

        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            return None

        return self.parse_event(data)

    def parse_event(
        self,
        data: dict[str, Any],
    ) -> StreamChunk:
        choices = data.get("choices") or []

        content = ""
        finish_reason = None
        tool_calls = []

        if choices:
            choice = choices[0]
            finish_reason = choice.get("finish_reason")

            delta = choice.get("delta") or {}

            value = delta.get("content")

            if isinstance(value, str):
                content = value

            elif isinstance(value, list):
                parts = []

                for part in value:
                    if isinstance(part, dict):
                        text = part.get("text")
                        if isinstance(text, str):
                            parts.append(text)

                content = "".join(parts)

            tool_calls = delta.get("tool_calls") or []

        usage = data.get("usage")

        return StreamChunk(
            content=content,
            provider=self.provider,
            model=data.get("model") or self.model,
            request_id=data.get("id") or self.request_id,
            finish_reason=finish_reason,
            usage=usage,
            tool_calls=tool_calls,
            metadata=data,
            done=finish_reason is not None,
        )

    async def parse(
        self,
        lines: AsyncIterator[str],
    ):
        async for line in lines:
            chunk = self.parse_line(line)

            if chunk is not None:
                yield chunk
