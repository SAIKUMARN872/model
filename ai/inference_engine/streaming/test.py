from __future__ import annotations

import asyncio

from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceResult,
)
from ai.inference_engine.streaming import (
    InferenceStream,
    StreamBuffer,
    TokenStream,
)
from ai.inference_engine.streaming.utils import (
    extract_content,
    is_finished,
)


async def mock_results():
    chunks = [
        InferenceResult(
            request_id="stream-test",
            model="mock-model",
            backend=InferenceBackendType.TRANSFORMERS,
            content="Hello ",
        ),
        InferenceResult(
            request_id="stream-test",
            model="mock-model",
            backend=InferenceBackendType.TRANSFORMERS,
            content="from ",
        ),
        InferenceResult(
            request_id="stream-test",
            model="mock-model",
            backend=InferenceBackendType.TRANSFORMERS,
            content="ModelNow",
            finish_reason="stop",
        ),
    ]

    for result in chunks:
        yield result


async def main() -> None:
    buffer = StreamBuffer()

    buffer.append("Hello ")
    buffer.append("World")

    assert buffer.get_content() == "Hello World"
    assert buffer.chunk_count == 2

    buffer.clear()

    assert buffer.get_content() == ""
    assert buffer.chunk_count == 0

    print("STREAM BUFFER: PASS")

    token_stream = TokenStream(
        ["Hello", " ", "ModelNow"]
    )

    tokens = []

    async for token in token_stream:
        tokens.append(token)

    assert tokens == [
        "Hello",
        " ",
        "ModelNow",
    ]

    print("TOKEN STREAM: PASS")

    results = mock_results()

    stream = InferenceStream(results)

    collected = await stream.collect()

    assert collected == "Hello from ModelNow"
    assert stream.buffer.chunk_count == 3

    print("INFERENCE STREAM: PASS")

    result = InferenceResult(
        request_id="utils-test",
        model="mock-model",
        backend=InferenceBackendType.TRANSFORMERS,
        content="Done",
        finish_reason="stop",
    )

    assert extract_content(result) == "Done"
    assert is_finished(result)

    print("STREAM UTILS: PASS")
    print("STREAMING TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
