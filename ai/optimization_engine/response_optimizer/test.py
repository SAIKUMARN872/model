"""Regression tests for the ModelNow response optimizer."""

from .formatter import (
    compact_whitespace,
    format_json,
    format_markdown,
    format_plain_text,
    format_structured,
    normalize_text,
    truncate_text,
)
from .optimizer import (
    ResponseOptimizationResult,
    ResponseOptimizer,
    create_response_optimizer,
)
from .streaming import (
    ResponseStreamer,
    StreamChunk,
    collect_response,
    stream_response,
)
from .utils import (
    calculate_compression_ratio,
    calculate_reduction,
    estimate_characters,
    estimate_tokens,
    merge_metadata,
    normalize_choices,
    response_id,
)


def test_formatter() -> None:
    assert normalize_text("  hello   world  ") == "hello world"
    assert format_plain_text("  hello  ") == "hello"
    assert format_markdown("  # Hello  \n\n  World  ") == "# Hello\n\nWorld"

    payload = {"answer": "hello", "score": 1}
    json_text = format_json(payload)
    assert '"answer"' in json_text
    assert format_structured(payload) == json_text

    assert truncate_text("abcdef", 4) == "a..."
    assert truncate_text("abc", 10) == "abc"
    assert compact_whitespace("hello   world\nagain") == "hello world again"


def test_streaming() -> None:
    streamer = ResponseStreamer(chunk_size=3)

    chunks = list(streamer.chunk_text("abcdefgh"))
    assert [chunk.content for chunk in chunks] == ["abc", "def", "gh"]
    assert chunks[-1].is_final is True
    assert chunks[0].index == 0

    normalized = list(
        streamer.normalize(
            ["one", {"text": "two"}, StreamChunk(0, "three")]
        )
    )
    assert [chunk.content for chunk in normalized] == [
        "one",
        "two",
        "three",
    ]

    assert streamer.collect(["hello", " ", "world"]) == "hello world"

    final_chunks = list(streamer.stream_with_final(["a", "b"]))
    assert final_chunks[-1].is_final is True

    assert list(stream_response("abcdef", chunk_size=2))[0].content == "ab"
    assert collect_response(["a", "b", "c"]) == "abc"


def test_utils() -> None:
    assert estimate_tokens("") == 0
    assert estimate_tokens("hello world") >= 1
    assert estimate_characters("hello") == 5

    assert calculate_compression_ratio("abcdefghij", "abcde") == 0.5
    assert calculate_reduction(100, 75) == 0.25
    assert calculate_reduction(0, 0) == 0.0

    first = response_id("hello", request_id="req-1")
    second = response_id("hello", request_id="req-1")
    assert first == second
    assert len(first) == 16

    assert merge_metadata(
        {"a": 1},
        {"b": 2},
        {"a": 3},
    ) == {"a": 3, "b": 2}

    assert normalize_choices([1, "two"]) == ["1", "two"]
    assert normalize_choices(None) == []


def test_optimizer() -> None:
    optimizer = ResponseOptimizer(
        max_chars=20,
        default_format="markdown",
    )

    result = optimizer.optimize(
        "This is a very long response that should be truncated.",
    )

    assert isinstance(result, ResponseOptimizationResult)
    assert result.format == "markdown"
    assert len(result.optimized) <= 20
    assert result.truncated is True
    assert result.optimized_tokens <= result.original_tokens
    assert result.token_reduction >= 0
    assert 0.0 <= result.compression_ratio <= 1.0

    assert optimizer.optimize_text(
        "Hello world",
    ) == "Hello world"

    json_optimizer = ResponseOptimizer(default_format="json")
    json_result = json_optimizer.optimize({"answer": "hello"})
    assert json_result.format == "json"
    assert '"answer"' in json_result.optimized

    text_optimizer = create_response_optimizer(
        max_chars=100,
        default_format="plain",
    )
    assert text_optimizer.optimize_text("hello") == "hello"


def test_limits_and_validation() -> None:
    optimizer = ResponseOptimizer(max_tokens=2)
    result = optimizer.optimize(
        "one two three four five six seven eight"
    )

    assert result.optimized_tokens <= 3

    try:
        ResponseOptimizer(default_format="xml")
        raise AssertionError("Expected ValueError")
    except ValueError:
        pass

    try:
        ResponseOptimizer(max_chars=0)
        raise AssertionError("Expected ValueError")
    except ValueError:
        pass

    try:
        ResponseStreamer(chunk_size=0)
        raise AssertionError("Expected ValueError")
    except ValueError:
        pass


def test_serialization() -> None:
    result = ResponseOptimizer().optimize("Hello world")

    data = result.as_dict()

    assert data["original"] == "Hello world"
    assert data["optimized"] == "Hello world"
    assert "original_tokens" in data
    assert "optimized_tokens" in data
    assert "compression_ratio" in data


def main() -> None:
    test_formatter()
    print("FORMATTER: PASS")

    test_streaming()
    print("STREAMING: PASS")

    test_utils()
    print("UTILS: PASS")

    test_optimizer()
    print("OPTIMIZER: PASS")

    test_limits_and_validation()
    print("LIMITS AND VALIDATION: PASS")

    test_serialization()
    print("SERIALIZATION: PASS")

    print("RESPONSE OPTIMIZER TESTS: PASS")
    print("TEST GROUPS: 6")


if __name__ == "__main__":
    main()
