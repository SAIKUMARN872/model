"""Response optimizer package for ModelNow."""

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

__all__ = [
    "ResponseOptimizationResult",
    "ResponseOptimizer",
    "ResponseStreamer",
    "StreamChunk",
    "calculate_compression_ratio",
    "calculate_reduction",
    "collect_response",
    "compact_whitespace",
    "create_response_optimizer",
    "estimate_characters",
    "estimate_tokens",
    "format_json",
    "format_markdown",
    "format_plain_text",
    "format_structured",
    "merge_metadata",
    "normalize_choices",
    "normalize_text",
    "response_id",
    "stream_response",
    "truncate_text",
]
