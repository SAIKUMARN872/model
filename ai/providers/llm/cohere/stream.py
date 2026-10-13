from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

from ...base.request import ChatRequest
from ...base.response import StreamChunk

from .client import CohereClient
from .utils import (
    build_chat_payload,
    extract_stream_finish_reason,
    extract_stream_text,
    extract_stream_usage,
)


class CohereStream:
    """Cohere streaming adapter for ModelNow."""

    def __init__(
        self,
        client: CohereClient,
    ) -> None:
        self.client = client

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        payload = build_chat_payload(request)

        payload["stream"] = True

        raw_stream = self.client.stream_chat(
            payload
        )

        for event in _parse_sse_events(
            raw_stream
        ):
            event_type = event.get(
                "type",
                "",
            )

            text = extract_stream_text(
                event
            )

            finish_reason = (
                extract_stream_finish_reason(
                    event
                )
            )

            usage = extract_stream_usage(
                event
            )

            done = event_type in {
                "message-end",
                "stream-end",
            }

            if (
                text
                or finish_reason
                or usage
                or done
            ):
                yield StreamChunk(
                    content=text,
                    provider="cohere",
                    model=request.model,
                    request_id=str(
                        request.request_id
                    ),
                    finish_reason=finish_reason,
                    usage=usage,
                    done=done,
                    metadata={
                        "event_type": event_type,
                    },
                )


def _parse_sse_events(
    raw: str,
) -> list[dict[str, Any]]:
    """Parse Cohere SSE response text."""

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
            "type": "stream-end"
        }

    try:
        value = json.loads(data)
    except json.JSONDecodeError:
        return None

    return value if isinstance(value, dict) else None


__all__ = ["CohereStream"]
