from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

from ...base.request import ChatRequest
from ...base.response import StreamChunk

from .client import GoogleClient
from .utils import (
    build_chat_payload,
    extract_stream_finish_reason,
    extract_stream_text,
    extract_stream_usage,
)


class GoogleStream:
    """Google Gemini streaming adapter for ModelNow."""

    def __init__(
        self,
        client: GoogleClient,
    ) -> None:
        self.client = client

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        payload = build_chat_payload(request)
        raw_stream = self.client.stream_generate_content(
            request.model,
            payload,
        )

        for event in _parse_sse_events(raw_stream):
            text = extract_stream_text(event)
            finish_reason = extract_stream_finish_reason(event)
            usage = extract_stream_usage(event)

            response_id = event.get("responseId")

            done = (
                event.get("done") is True
                or finish_reason is not None
            )

            yield StreamChunk(
                content=text,
                provider="google",
                model=request.model,
                request_id=(
                    str(response_id)
                    if response_id is not None
                    else str(request.request_id)
                ),
                finish_reason=finish_reason,
                usage=usage,
                done=done,
                metadata={
                    "object": event.get("object"),
                },
            )


def _parse_sse_events(
    raw: str,
) -> list[dict[str, Any]]:
    """Parse Gemini SSE response text."""

    events: list[dict[str, Any]] = []
    current_data: list[str] = []

    for line in raw.splitlines():
        line = line.strip()

        if not line:
            if current_data:
                event = _decode_event(
                    "\n".join(current_data)
                )

                if event is not None:
                    events.append(event)

                current_data = []

            continue

        if line.startswith("data:"):
            current_data.append(
                line[5:].strip()
            )

    if current_data:
        event = _decode_event(
            "\n".join(current_data)
        )

        if event is not None:
            events.append(event)

    return events


def _decode_event(
    data: str,
) -> dict[str, Any] | None:
    if not data:
        return None

    if data == "[DONE]":
        return {
            "done": True
        }

    try:
        value = json.loads(data)
    except json.JSONDecodeError:
        return None

    return (
        value
        if isinstance(value, dict)
        else None
    )


__all__ = ["GoogleStream"]
