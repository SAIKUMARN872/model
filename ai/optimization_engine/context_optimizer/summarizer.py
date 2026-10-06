from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    calculate_reduction_ratio,
    deduplicate_lines,
)


@dataclass(frozen=True)
class ContextSummaryResult:
    original_context: str
    summary: str
    original_characters: int
    summary_characters: int
    characters_saved: int
    reduction_ratio: Decimal
    reduction_percent: Decimal
    changed: bool


class ContextSummarizer:
    """Create deterministic summaries from structured context lines."""

    def __init__(self, *, minimum_lines: int = 1) -> None:
        if minimum_lines < 1:
            raise ValueError("minimum_lines must be at least 1")

        self.minimum_lines = minimum_lines

    def summarize(
        self,
        context: str,
        *,
        max_characters: int | None = None,
    ) -> ContextSummaryResult:
        if not isinstance(context, str):
            raise TypeError("context must be a string")

        if max_characters is not None and max_characters < 1:
            raise ValueError("max_characters must be greater than zero")

        original = context

        lines = deduplicate_lines(context.splitlines())

        if not lines:
            summary = ""
        elif len(lines) <= self.minimum_lines and max_characters is None:
            summary = "\n".join(lines)
        else:
            selected = lines[:]

            if max_characters is not None:
                selected = self._fit_to_budget(
                    selected,
                    max_characters,
                )

            summary = "\n".join(selected)

        original_characters = len(original)
        summary_characters = len(summary)

        characters_saved = calculate_reduction(
            original_characters,
            summary_characters,
        )

        reduction_ratio = calculate_reduction_ratio(
            original_characters,
            summary_characters,
        )

        reduction_percent = calculate_reduction_percent(
            original_characters,
            summary_characters,
        )

        return ContextSummaryResult(
            original_context=original,
            summary=summary,
            original_characters=original_characters,
            summary_characters=summary_characters,
            characters_saved=characters_saved,
            reduction_ratio=reduction_ratio,
            reduction_percent=reduction_percent,
            changed=original != summary,
        )

    @staticmethod
    def _fit_to_budget(
        lines: list[str],
        max_characters: int,
    ) -> list[str]:
        selected: list[str] = []
        current_length = 0

        for line in lines:
            separator_length = 1 if selected else 0
            projected_length = current_length + separator_length + len(line)

            if projected_length <= max_characters:
                selected.append(line)
                current_length = projected_length
                continue

            if not selected and max_characters > 0:
                selected.append(line[:max_characters])

            break

        return selected

    def should_summarize(
        self,
        context: str,
        *,
        max_characters: int,
    ) -> bool:
        if max_characters < 1:
            raise ValueError("max_characters must be greater than zero")

        return len(context) > max_characters


def create_default_summarizer() -> ContextSummarizer:
    """Create the default context summarizer."""
    return ContextSummarizer()


__all__ = [
    "ContextSummaryResult",
    "ContextSummarizer",
    "create_default_summarizer",
]
