from __future__ import annotations

from typing import Any

from ai.providers.base.response import (
    ChatUsage,
    StreamChunk,
)


class AWSBedrockStreamParser:
    def __init__(
        self,
        model: str,
        request_id: str | None = None,
    ) -> None:
        self.model = model
        self.request_id = request_id

    def parse_event(
        self,
        event: dict[str, Any],
    ) -> StreamChunk | None:
        if not isinstance(event, dict):
            return None

        if "messageStart" in event:
            return StreamChunk(
                content="",
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                metadata={
                    "message_start": event[
                        "messageStart"
                    ]
                },
            )

        if "contentBlockStart" in event:
            return StreamChunk(
                content="",
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                metadata={
                    "content_block_start": event[
                        "contentBlockStart"
                    ]
                },
            )

        if "contentBlockDelta" in event:
            block = (
                event["contentBlockDelta"]
                or {}
            )

            delta = block.get(
                "delta"
            ) or {}

            content = delta.get(
                "text",
                "",
            )

            tool_use = delta.get(
                "toolUse"
            )

            metadata: dict[str, Any] = {
                "content_block_index": block.get(
                    "contentBlockIndex"
                )
            }

            if tool_use is not None:
                metadata["tool_use"] = tool_use

            return StreamChunk(
                content=(
                    content
                    if isinstance(
                        content,
                        str,
                    )
                    else ""
                ),
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                tool_calls=(
                    [tool_use]
                    if isinstance(
                        tool_use,
                        dict,
                    )
                    else []
                ),
                metadata=metadata,
            )

        if "contentBlockStop" in event:
            return StreamChunk(
                content="",
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                metadata={
                    "content_block_stop": event[
                        "contentBlockStop"
                    ]
                },
            )

        if "messageStop" in event:
            stop = (
                event["messageStop"]
                or {}
            )

            return StreamChunk(
                content="",
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                finish_reason=stop.get(
                    "stopReason"
                ),
                metadata={
                    "message_stop": stop
                },
                done=True,
            )

        if "metadata" in event:
            metadata = (
                event["metadata"]
                or {}
            )

            usage = metadata.get(
                "usage"
            )

            return StreamChunk(
                content="",
                provider="aws_bedrock",
                model=self.model,
                request_id=self.request_id,
                usage=self._parse_usage(
                    usage
                ),
                metadata={
                    "metrics": metadata.get(
                        "metrics"
                    )
                },
            )

        return None

    @staticmethod
    def _parse_usage(
        usage: dict[str, Any] | None,
    ) -> ChatUsage | None:
        if not usage:
            return None

        input_tokens = int(
            usage.get(
                "inputTokens",
                0,
            )
            or 0
        )

        output_tokens = int(
            usage.get(
                "outputTokens",
                0,
            )
            or 0
        )

        total_tokens = int(
            usage.get(
                "totalTokens",
                input_tokens + output_tokens,
            )
            or 0
        )

        return ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            metadata=usage,
        )
