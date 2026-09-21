cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from __future__ import annotations

import json
from collections.abc import AsyncIterable, AsyncIterator

from ai.providers.base import ChatRequest, StreamChunk


def build_stream_payload(
    request: ChatRequest,
) -> dict:
    """
    Build an Azure/OpenAI-compatible streaming payload
    from a normalized ModelNow ChatRequest.
    """

    from .chat import build_chat_payload

    payload = build_chat_payload(request)
    payload["stream"] = True

    return payload


def parse_sse_line(
    line: str,
) -> StreamChunk | None:
    """
    Parse one Server-Sent Event line from Azure OpenAI.

    Supported examples:

        data: {"choices":[...]}
        data: [DONE]

    Empty/comment lines are ignored.
    """

    if isinstance(line, bytes):
        line = line.decode("utf-8", errors="replace")

    line = line.strip()

    if not line:
        return None

    if line.startswith(":"):
        return None

    if line.startswith("data:"):
        line = line[5:].strip()

    if not line:
        return None

    if line == "[DONE]":
        return StreamChunk(
            provider="azure_openai",
            done=True,
        )

    try:
        payload = json.loads(line)
    except json.JSONDecodeError:
        return None

    choices = payload.get("choices") or []

    if not choices:
        return StreamChunk(
            provider="azure_openai",
            model=payload.get("model"),
            request_id=payload.get("id"),
            metadata=payload,
        )

    choice = choices[0] or {}
    delta = choice.get("delta") or {}

    content = delta.get("content") or ""
    tool_calls = delta.get("tool_calls") or []
    finish_reason = choice.get("finish_reason")

    metadata = {}

    if payload.get("usage") is not None:
        metadata["usage"] = payload["usage"]

    if delta.get("role") is not None:
        metadata["role"] = delta["role"]

    return StreamChunk(
        content=content,
        provider="azure_openai",
        model=payload.get("model"),
        request_id=payload.get("id"),
        finish_reason=finish_reason,
        tool_calls=tool_calls,
        metadata=metadata,
    )


async def parse_sse_stream(
    lines: AsyncIterable[str],
) -> AsyncIterator[StreamChunk]:
    """
    Convert an async SSE line stream into normalized
    ModelNow StreamChunk objects.
    """

    async for line in lines:
        chunk = parse_sse_line(line)

        if chunk is None:
            continue

        yield chunk

        if chunk.done:
            break


__all__ = [
    "build_stream_payload",
    "parse_sse_line",
    "parse_sse_stream",
]
'@ | Set-Content ".\ai\providers\llm\azure_openai\stream.py" -Encoding UTF8