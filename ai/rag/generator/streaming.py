from __future__ import annotations

import inspect
from collections.abc import AsyncIterator, Callable
from typing import Any


async def stream_answer(
    stream_fn: Callable[..., Any],
    query: str,
    context: str,
    sources: Any,
) -> AsyncIterator[str]:
    if not callable(stream_fn):
        raise TypeError("stream_fn must be callable")

    if not isinstance(query, str) or not query.strip():
        raise ValueError("query must not be empty")

    if not isinstance(context, str):
        raise TypeError("context must be a string")

    result = stream_fn(query.strip(), context.strip(), sources)

    if inspect.isawaitable(result):
        result = await result

    if isinstance(result, str):
        if result:
            yield result
        return

    if hasattr(result, "__aiter__"):
        async for chunk in result:
            if not isinstance(chunk, str):
                raise TypeError("Every streamed chunk must be a string")
            if chunk:
                yield chunk
        return

    try:
        iterator = iter(result)
    except TypeError as exc:
        raise TypeError(
            "stream_fn must return a string or an iterable of strings"
        ) from exc

    for chunk in iterator:
        if not isinstance(chunk, str):
            raise TypeError("Every streamed chunk must be a string")
        if chunk:
            yield chunk


async def collect_stream(
    stream_fn: Callable[..., Any],
    query: str,
    context: str,
    sources: Any,
) -> str:
    chunks = [
        chunk
        async for chunk in stream_answer(
            stream_fn, query, context, sources
        )
    ]
    return "".join(chunks)
