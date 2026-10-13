from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

from ai.providers.base.response import StreamChunk


class AzureOpenAIStreamParser:
    def __init__(self, deployment: str) -> None:
        self.deployment = deployment

    def parse_line(self, line: str) -> StreamChunk | None:
        line = line.strip()

        if not line:
            return None

        if line.startswith("data:"):
            line = line[5:].strip()

        if line == "[DONE]":
            return StreamChunk(
                provider="azure_openai",
                model=self.deployment,
                finish_reason="stop",
                done=True,
            )

        try:
            payload: dict[str, Any] = json.loads(line)
        except json.JSONDecodeError:
            return None

        choices = payload.get("choices") or []

        if not choices:
            return StreamChunk(
                provider="azure_openai",
                model=self.deployment,
                request_id=payload.get("id"),
                metadata={
                    "raw_response": payload,
                },
            )

        choice = choices[0] or {}
        delta = choice.get("delta") or {}

        content = delta.get("content") or ""
        finish_reason = choice.get("finish_reason")

        tool_calls = delta.get("tool_calls") or []

        done = finish_reason is not None

        return StreamChunk(
            content=content,
            provider="azure_openai",
            model=self.deployment,
            request_id=payload.get("id"),
            finish_reason=finish_reason,
            tool_calls=tool_calls,
            metadata={
                "raw_response": payload,
                "index": choice.get("index", 0),
            },
            done=done,
        )


async def parse_sse_stream(
    lines: AsyncIterator[str],
    deployment: str,
) -> AsyncIterator[StreamChunk]:
    parser = AzureOpenAIStreamParser(deployment)

    async for line in lines:
        chunk = parser.parse_line(line)

        if chunk is not None:
            yield chunk
