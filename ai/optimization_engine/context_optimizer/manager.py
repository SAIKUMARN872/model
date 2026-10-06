from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .compressor import ContextCompressor
from .summarizer import ContextSummarizer
from .window import ContextWindow


@dataclass(frozen=True)
class ContextOptimizationResult:
    original_context: str
    optimized_context: str
    original_characters: int
    optimized_characters: int
    characters_saved: int
    reduction_percent: Decimal
    compressed: bool
    summarized: bool
    windowed: bool
    changed: bool


class ContextManager:
    """Coordinate context compression, summarization, and windowing."""

    def __init__(
        self,
        *,
        compressor: ContextCompressor | None = None,
        summarizer: ContextSummarizer | None = None,
        window: ContextWindow | None = None,
    ) -> None:
        self.compressor = compressor or ContextCompressor()
        self.summarizer = summarizer or ContextSummarizer()
        self.window = window

    def optimize(
        self,
        context: str,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        summary_threshold: int | None = None,
    ) -> ContextOptimizationResult:
        if not isinstance(context, str):
            raise TypeError("context must be a string")

        original = context
        optimized = context

        compressed = False
        summarized = False
        windowed = False

        compression_result = self.compressor.compress(optimized)

        if compression_result.changed:
            optimized = compression_result.compressed_context
            compressed = True

        if summary_threshold is not None:
            if summary_threshold < 1:
                raise ValueError(
                    "summary_threshold must be greater than zero"
                )

            if len(optimized) > summary_threshold:
                summary_result = self.summarizer.summarize(
                    optimized,
                    max_characters=summary_threshold,
                )

                if summary_result.changed:
                    optimized = summary_result.summary
                    summarized = True

        active_window = self.window

        if max_characters is not None or max_tokens is not None:
            active_window = ContextWindow(
                max_characters=max_characters,
                max_tokens=max_tokens,
            )

        if active_window is not None:
            window_result = active_window.fit(optimized)

            if window_result.truncated:
                optimized = window_result.windowed_context
                windowed = True

        original_characters = len(original)
        optimized_characters = len(optimized)

        characters_saved = max(
            0,
            original_characters - optimized_characters,
        )

        if original_characters:
            reduction_percent = (
                Decimal(characters_saved)
                / Decimal(original_characters)
                * Decimal("100")
            )
        else:
            reduction_percent = Decimal("0")

        return ContextOptimizationResult(
            original_context=original,
            optimized_context=optimized,
            original_characters=original_characters,
            optimized_characters=optimized_characters,
            characters_saved=characters_saved,
            reduction_percent=reduction_percent,
            compressed=compressed,
            summarized=summarized,
            windowed=windowed,
            changed=original != optimized,
        )

    def should_optimize(
        self,
        context: str,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        summary_threshold: int | None = None,
    ) -> bool:
        if max_characters is not None and max_characters < 1:
            raise ValueError(
                "max_characters must be greater than zero"
            )

        if max_tokens is not None and max_tokens < 1:
            raise ValueError(
                "max_tokens must be greater than zero"
            )

        if summary_threshold is not None and summary_threshold < 1:
            raise ValueError(
                "summary_threshold must be greater than zero"
            )

        if max_characters is not None and len(context) > max_characters:
            return True

        if summary_threshold is not None and len(context) > summary_threshold:
            return True

        if max_tokens is not None:
            active_window = self.window or ContextWindow(
                max_tokens=max_tokens,
            )

            if not active_window.within_window(context):
                return True

        return self.compressor.should_compress(context)


def create_default_manager(
    *,
    max_characters: int | None = None,
    max_tokens: int | None = None,
) -> ContextManager:
    """Create a default context manager."""
    window = None

    if max_characters is not None or max_tokens is not None:
        window = ContextWindow(
            max_characters=max_characters,
            max_tokens=max_tokens,
        )

    return ContextManager(window=window)


__all__ = [
    "ContextOptimizationResult",
    "ContextManager",
    "create_default_manager",
]
