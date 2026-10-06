from __future__ import annotations

from .buffer import StreamBuffer
from .stream import (
    ResponseStream,
    StreamStatus,
)
from .token_stream import TokenStream
from .utils import (
    calculate_duration_ms,
    calculate_tokens_per_second,
    chunk_size_bytes,
    estimate_tokens,
    normalize_chunk,
    split_text,
    validate_buffer_size,
    validate_chunk_size,
    validate_max_chunks,
)


def check(name: str, condition: bool) -> None:
    if not condition:
        raise AssertionError(f"{name}: FAIL")

    print(f"{name}: PASS")


def test_utils() -> None:
    check(
        "CHUNK SIZE VALIDATION",
        validate_chunk_size(4) == 4,
    )

    check(
        "BUFFER SIZE VALIDATION",
        validate_buffer_size(1024) == 1024,
    )

    check(
        "MAX CHUNKS VALIDATION",
        validate_max_chunks(10) == 10,
    )

    check(
        "CHUNK NORMALIZATION",
        normalize_chunk("hello") == "hello",
    )

    check(
        "CHUNK SIZE",
        chunk_size_bytes("hello") == 5,
    )

    check(
        "TOKEN ESTIMATION",
        estimate_tokens("hello") == 2,
    )

    check(
        "TEXT SPLITTING",
        split_text("abcdefgh", 3)
        == ("abc", "def", "gh"),
    )

    check(
        "DURATION CALCULATION",
        calculate_duration_ms(1.0, 1.5)
        == 500.0,
    )

    check(
        "TOKEN THROUGHPUT",
        calculate_tokens_per_second(10, 2000)
        == 5.0,
    )


def test_buffer() -> None:
    buffer = StreamBuffer(
        max_buffer_size=100,
    )

    check(
        "BUFFER INITIAL STATE",
        buffer.empty,
    )

    buffer.append("Hello")
    buffer.append(" world")

    check(
        "BUFFER APPEND",
        buffer.text() == "Hello world",
    )

    check(
        "BUFFER CHUNK COUNT",
        buffer.size == 2,
    )

    check(
        "BUFFER BYTE COUNT",
        buffer.total_bytes == 11,
    )

    check(
        "BUFFER TOKEN COUNT",
        buffer.total_tokens == 4,
    )

    snapshot = buffer.snapshot()

    check(
        "BUFFER SNAPSHOT",
        snapshot.text == "Hello world",
    )

    buffer.clear()

    check(
        "BUFFER CLEAR",
        buffer.empty,
    )

    buffer.close()

    check(
        "BUFFER CLOSE",
        buffer.closed,
    )


def test_token_stream() -> None:
    stream = TokenStream()

    stream.push("Hello")
    stream.push(" world")

    check(
        "TOKEN STREAM TEXT",
        stream.text() == "Hello world",
    )

    check(
        "TOKEN STREAM CHUNKS",
        tuple(stream.iter_chunks())
        == ("Hello", " world"),
    )

    check(
        "TOKEN STREAM BYTES",
        stream.total_bytes == 11,
    )

    check(
        "TOKEN STREAM TOKENS",
        stream.total_tokens == 4,
    )

    snapshot = stream.snapshot()

    check(
        "TOKEN STREAM SNAPSHOT",
        snapshot.text == "Hello world",
    )

    stream.complete()

    check(
        "TOKEN STREAM COMPLETE",
        stream.completed,
    )


def test_response_stream() -> None:
    stream = ResponseStream(
        stream_id="test-stream",
    )

    check(
        "STREAM INITIAL STATUS",
        stream.status == StreamStatus.CREATED,
    )

    stream.start()

    check(
        "STREAM START",
        stream.active,
    )

    stream.push("Hello")
    stream.push(" world")

    check(
        "STREAM TEXT",
        stream.text() == "Hello world",
    )

    check(
        "STREAM CHUNK ITERATION",
        tuple(stream.iter_chunks())
        == ("Hello", " world"),
    )

    snapshot = stream.complete()

    check(
        "STREAM COMPLETE",
        stream.completed,
    )

    check(
        "STREAM SNAPSHOT ID",
        snapshot.stream_id == "test-stream",
    )

    check(
        "STREAM SNAPSHOT STATUS",
        snapshot.status == StreamStatus.COMPLETED,
    )

    check(
        "STREAM SNAPSHOT TEXT",
        snapshot.text == "Hello world",
    )

    check(
        "STREAM SNAPSHOT TOKENS",
        snapshot.total_tokens == 4,
    )

    check(
        "STREAM SNAPSHOT BYTES",
        snapshot.total_bytes == 11,
    )


def test_stream_auto_start() -> None:
    stream = ResponseStream(
        stream_id="auto-stream",
    )

    stream.push("automatic")

    check(
        "AUTO START",
        stream.active,
    )

    stream.complete()

    check(
        "AUTO START COMPLETION",
        stream.completed,
    )


def test_stream_failure() -> None:
    stream = ResponseStream(
        stream_id="failed-stream",
    )

    stream.start()
    stream.push("partial")

    snapshot = stream.fail(
        "test failure"
    )

    check(
        "STREAM FAILURE",
        stream.failed,
    )

    check(
        "FAILURE STATUS",
        snapshot.status == StreamStatus.FAILED,
    )

    check(
        "FAILURE MESSAGE",
        snapshot.token_stream.error
        == "test failure",
    )


def test_buffer_limit() -> None:
    buffer = StreamBuffer(
        max_buffer_size=5,
    )

    buffer.append("hello")

    try:
        buffer.append("!")
    except BufferError:
        pass
    else:
        raise AssertionError(
            "Buffer limit should be enforced"
        )

    check(
        "BUFFER LIMIT",
        buffer.total_bytes == 5,
    )


def test_validation() -> None:
    try:
        validate_chunk_size(0)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Invalid chunk size should fail"
        )

    try:
        validate_buffer_size(0)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Invalid buffer size should fail"
        )

    try:
        validate_max_chunks(0)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Invalid max chunks should fail"
        )

    check(
        "INPUT VALIDATION",
        True,
    )


def main() -> None:
    print("MODELNOW STREAMING TEST")

    test_utils()
    test_buffer()
    test_token_stream()
    test_response_stream()
    test_stream_auto_start()
    test_stream_failure()
    test_buffer_limit()
    test_validation()

    print(
        "MODELNOW STREAMING TEST: PASS"
    )


if __name__ == "__main__":
    main()
