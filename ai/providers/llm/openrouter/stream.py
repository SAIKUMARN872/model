from __future__ import annotations

import json
from typing import Any

from ai.providers.base.response import StreamChunk


class OpenRouterStreamParser:
    def __init__(
        self,
        model: str,
        request_id: str | None = None,
    ) -> None:
        self.model = model
        self.request_id = request_id

    def parse_line(
        self,
        line: str,
    ) -> StreamChunk | None:
        line = line.strip()

        if not line:
            return None

        if line.startswith("data:"):
            line = line[5:].strip()

        if line == "[DONE]":
            return StreamChunk(
                content="",
                provider="openrouter",
                model=self.model,
                request_id=self.request_id,
                finish_reason="stop",
                done=True,
            )

        try:
            data: dict[str, Any] = json.loads(line)
        except json.JSONDecodeError:
            return None

        choices = data.get("choices") or []

        if not choices:
            usage = self._parse_usage(data)

            if usage is not None:
                return StreamChunk(
                    content="",
                    provider="openrouter",
                    model=self.model,
                    request_id=(
                        data.get("id") or self.request_id
                    ),
                    usage=usage,
                )

            return None

        choice = choices[0]
        delta = choice.get("delta") or {}

        content = delta.get("content") or ""

        tool_calls = delta.get("tool_calls") or []

        finish_reason = choice.get("finish_reason")

        done = finish_reason is not None

        usage = self._parse_usage(data)

        return StreamChunk(
            content=content,
            provider="openrouter",
            model=self.model,
            request_id=data.get("id") or self.request_id,
            finish_reason=finish_reason,
            usage=usage,
            tool_calls=tool_calls,
            metadata={
                "index": choice.get("index", 0),
            },
            done=done,
        )

    @staticmethod
    def _parse_usage(data: dict[str, Any]):
        usage = data.get("usage")

        if not usage:
            return None

        from ai.providers.base.response import ChatUsage

        input_tokens = int(
            usage.get(
                "prompt_tokens",
                usage.get("input_tokens", 0),
            )
            or 0
        )

        output_tokens = int(
            usage.get(
                "completion_tokens",
                usage.get("output_tokens", 0),
            )
            or 0
        )

        total_tokens = int(
            usage.get(
                "total_tokens",
                input_tokens + output_tokens,
            )
            or 0
        )

        return ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            estimated_cost=float(
                usage.get("cost", 0.0) or 0.0
            ),
            reasoning_tokens=int(
                usage.get("reasoning_tokens", 0) or 0
            ),
            metadata=usage,
        )
