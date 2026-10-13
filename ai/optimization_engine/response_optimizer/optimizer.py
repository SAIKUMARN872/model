"""Response optimization engine for ModelNow."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from .formatter import (
    format_json,
    format_markdown,
    format_plain_text,
    truncate_text,
)
from .utils import (
    calculate_compression_ratio,
    estimate_tokens,
)


@dataclass(frozen=True)
class ResponseOptimizationResult:
    """Result produced by the response optimizer."""

    original: str
    optimized: str
    format: str
    original_tokens: int
    optimized_tokens: int
    compression_ratio: float
    truncated: bool
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "metadata", dict(self.metadata))

    @property
    def token_reduction(self) -> int:
        """Return the estimated number of tokens removed."""
        return max(0, self.original_tokens - self.optimized_tokens)

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "original": self.original,
            "optimized": self.optimized,
            "format": self.format,
            "original_tokens": self.original_tokens,
            "optimized_tokens": self.optimized_tokens,
            "compression_ratio": self.compression_ratio,
            "truncated": self.truncated,
            "token_reduction": self.token_reduction,
            "metadata": dict(self.metadata),
        }


class ResponseOptimizer:
    """Optimize model responses for delivery and downstream consumption."""

    SUPPORTED_FORMATS = {"plain", "text", "markdown", "json"}

    def __init__(
        self,
        *,
        max_chars: int | None = None,
        max_tokens: int | None = None,
        default_format: str = "markdown",
    ) -> None:
        if max_chars is not None and (
            not isinstance(max_chars, int) or max_chars <= 0
        ):
            raise ValueError("max_chars must be a positive integer or None")

        if max_tokens is not None and (
            not isinstance(max_tokens, int) or max_tokens <= 0
        ):
            raise ValueError("max_tokens must be a positive integer or None")

        normalized_format = default_format.strip().lower()

        if normalized_format not in self.SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported format: {default_format}"
            )

        self.max_chars = max_chars
        self.max_tokens = max_tokens
        self.default_format = normalized_format

    def format(
        self,
        response: Any,
        *,
        output_format: str | None = None,
    ) -> str:
        """Format a response according to the requested output format."""
        selected = (
            self.default_format
            if output_format is None
            else output_format.strip().lower()
        )

        if selected not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {selected}")

        if selected in {"plain", "text"}:
            return format_plain_text(response)

        if selected == "markdown":
            return format_markdown(response)

        return format_json(response)

    def optimize(
        self,
        response: Any,
        *,
        output_format: str | None = None,
        max_chars: int | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> ResponseOptimizationResult:
        """Format and optimize a response."""
        original = (
            response
            if isinstance(response, str)
            else str(response)
        )

        optimized = self.format(
            response,
            output_format=output_format,
        )

        character_limit = (
            self.max_chars
            if max_chars is None
            else max_chars
        )

        if character_limit is not None:
            optimized = truncate_text(
                optimized,
                character_limit,
            )

        if self.max_tokens is not None:
            estimated = estimate_tokens(optimized)

            if estimated > self.max_tokens:
                approximate_chars = max(
                    1,
                    int(
                        len(optimized)
                        * self.max_tokens
                        / estimated
                    ),
                )

                optimized = truncate_text(
                    optimized,
                    approximate_chars,
                )

        original_tokens = estimate_tokens(original)
        optimized_tokens = estimate_tokens(optimized)

        return ResponseOptimizationResult(
            original=original,
            optimized=optimized,
            format=(
                self.default_format
                if output_format is None
                else output_format.strip().lower()
            ),
            original_tokens=original_tokens,
            optimized_tokens=optimized_tokens,
            compression_ratio=calculate_compression_ratio(
                original,
                optimized,
            ),
            truncated=optimized != self.format(
                response,
                output_format=output_format,
            ),
            metadata=metadata or {},
        )

    def optimize_text(
        self,
        response: str,
        **kwargs: Any,
    ) -> str:
        """Return only the optimized response text."""
        return self.optimize(response, **kwargs).optimized


def create_response_optimizer(
    *,
    max_chars: int | None = None,
    max_tokens: int | None = None,
    default_format: str = "markdown",
) -> ResponseOptimizer:
    """Create a response optimizer."""
    return ResponseOptimizer(
        max_chars=max_chars,
        max_tokens=max_tokens,
        default_format=default_format,
    )


__all__ = [
    "ResponseOptimizationResult",
    "ResponseOptimizer",
    "create_response_optimizer",
]
