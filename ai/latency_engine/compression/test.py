from __future__ import annotations

from .compressor import RequestCompressor
from .token_compression import TokenCompressor
from .utils import (
    compression_ratio,
    estimate_message_tokens,
    estimate_tokens,
    normalize_text,
    reduction_percent,
    remove_repeated_spaces,
    truncate_to_char_limit,
)


def main() -> None:
    compressor = TokenCompressor(
        max_reduction_percent=40.0,
    )

    text = "  ModelNow   improves   AI latency.  \n\n  "
    result = compressor.compress(text)

    assert result.original_text == text
    assert result.compressed_text == (
        "ModelNow improves AI latency."
    )
    assert result.original_characters > (
        result.compressed_characters
    )
    assert result.reduced is True
    assert result.reduction_percent > 0.0
    assert 0.0 < result.compression_ratio < 1.0
    print("TEXT COMPRESSION: PASS")

    empty = compressor.compress("")

    assert empty.compressed_text == ""
    assert empty.original_characters == 0
    assert empty.compressed_characters == 0
    assert empty.reduction_percent == 0.0
    print("EMPTY TEXT: PASS")

    messages = [
        {
            "role": "system",
            "content": "  You are   ModelNow.  ",
        },
        {
            "role": "user",
            "content": "  Explain   latency optimization.  ",
        },
        {
            "role": "assistant",
            "content": {
                "type": "image",
                "url": "image://test",
            },
        },
    ]

    compressed_messages = compressor.compress_messages(
        messages
    )

    assert len(compressed_messages) == 3
    assert compressed_messages[0]["content"] == (
        "You are ModelNow."
    )
    assert compressed_messages[1]["content"] == (
        "Explain latency optimization."
    )
    assert compressed_messages[2]["content"] == {
        "type": "image",
        "url": "image://test",
    }
    print("MESSAGE COMPRESSION: PASS")

    request_compressor = RequestCompressor(
        compressor=compressor,
    )

    request_result = request_compressor.compress_messages(
        messages
    )

    assert request_result.original_tokens > 0
    assert request_result.compressed_tokens > 0
    assert request_result.tokens_saved >= 0
    assert request_result.reduction_percent >= 0.0
    assert (
        request_result.original_messages
        != request_result.compressed_messages
    )
    print("REQUEST COMPRESSION: PASS")

    assert (
        request_compressor.estimate_text_tokens(
            "ModelNow latency"
        )
        > 0
    )

    assert (
        request_compressor.estimate_messages_tokens(
            messages
        )
        > 0
    )
    print("TOKEN ESTIMATION: PASS")

    assert normalize_text(
        "  ModelNow   AI   platform  "
    ) == "ModelNow AI platform"

    assert remove_repeated_spaces(
        "  ModelNow    latency   "
    ) == "ModelNow latency"

    assert truncate_to_char_limit(
        "ModelNow",
        4,
    ) == "Mode"

    print("TEXT UTILITIES: PASS")

    assert compression_ratio(
        100,
        75,
    ) == 0.75

    assert reduction_percent(
        100,
        75,
    ) == 25.0

    assert estimate_tokens(
        "ModelNow"
    ) == 2

    assert estimate_message_tokens(
        [
            {
                "role": "user",
                "content": "ModelNow",
            }
        ]
    ) == 2

    print("COMPRESSION METRICS: PASS")

    print("MODELNOW LATENCY COMPRESSION TEST: PASS")


if __name__ == "__main__":
    main()
