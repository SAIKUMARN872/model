from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .utils import estimate_tokens, normalize_context


@dataclass(frozen=True)
class ContextWindowResult:
    original_context: str
    windowed_context: str
    original_characters: int
    windowed_characters: int
    original_tokens: int
    windowed_tokens: int
    truncated: bool
    utilization: Decimal


class ContextWindow:
    """Manage context within character and token budgets."""

    def __init__(
        self,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        characters_per_token: float = 4.0,
    ) -> None:
        if max_characters is not None and max_characters < 1:
            raise ValueError("max_characters must be greater than zero")

        if max_tokens is not None and max_tokens < 1:
            raise ValueError("max_tokens must be greater than zero")

        if characters_per_token <= 0:
            raise ValueError("characters_per_token must be greater than zero")

        if max_characters is None and max_tokens is None:
            raise ValueError(
                "at least one context window limit must be provided"
            )

        self.max_characters = max_characters
        self.max_tokens = max_tokens
        self.characters_per_token = characters_per_token

    def fit(self, context: str) -> ContextWindowResult:
        if not isinstance(context, str):
            raise TypeError("context must be a string")

        original = normalize_context(context)

        windowed = self._apply_character_limit(original)
        windowed = self._apply_token_limit(windowed)

        original_characters = len(original)
        windowed_characters = len(windowed)

        original_tokens = estimate_tokens(
            original,
            self.characters_per_token,
        )

        windowed_tokens = estimate_tokens(
            windowed,
            self.characters_per_token,
        )

        if not windowed:
            windowed_tokens = 0

        utilization = self._calculate_utilization(
            windowed_characters,
            windowed_tokens,
        )

        return ContextWindowResult(
            original_context=original,
            windowed_context=windowed,
            original_characters=original_characters,
            windowed_characters=windowed_characters,
            original_tokens=original_tokens,
            windowed_tokens=windowed_tokens,
            truncated=original != windowed,
            utilization=utilization,
        )

    def within_window(self, context: str) -> bool:
        """Return whether context already fits the configured limits."""
        if not isinstance(context, str):
            raise TypeError("context must be a string")

        normalized = normalize_context(context)

        if (
            self.max_characters is not None
            and len(normalized) > self.max_characters
        ):
            return False

        if self.max_tokens is not None:
            tokens = estimate_tokens(
                normalized,
                self.characters_per_token,
            )

            if tokens > self.max_tokens:
                return False

        return True

    def _apply_character_limit(self, context: str) -> str:
        if (
            self.max_characters is None
            or len(context) <= self.max_characters
        ):
            return context

        return self._truncate_lines(
            context,
            self.max_characters,
        )

    def _apply_token_limit(self, context: str) -> str:
        if self.max_tokens is None:
            return context

        if not context:
            return context

        estimated = estimate_tokens(
            context,
            self.characters_per_token,
        )

        if estimated <= self.max_tokens:
            return context

        character_budget = max(
            1,
            int(self.max_tokens * self.characters_per_token),
        )

        return self._truncate_lines(
            context,
            character_budget,
        )

    @staticmethod
    def _truncate_lines(
        context: str,
        character_budget: int,
    ) -> str:
        if character_budget <= 0:
            return ""

        lines = context.splitlines()

        selected: list[str] = []
        current_length = 0

        for line in reversed(lines):
            separator = 1 if selected else 0
            projected = current_length + separator + len(line)

            if projected <= character_budget:
                selected.insert(0, line)
                current_length = projected
                continue

            remaining = character_budget - current_length - separator

            if remaining > 0:
                selected.insert(0, line[-remaining:])

            break

        return "\n".join(selected)

    def _calculate_utilization(
        self,
        characters: int,
        tokens: int,
    ) -> Decimal:
        utilization_values: list[Decimal] = []

        if self.max_characters is not None:
            utilization_values.append(
                Decimal(characters) / Decimal(self.max_characters)
            )

        if self.max_tokens is not None:
            utilization_values.append(
                Decimal(tokens) / Decimal(self.max_tokens)
            )

        if not utilization_values:
            return Decimal("0")

        utilization = max(utilization_values)

        if utilization < 0:
            return Decimal("0")

        if utilization > 1:
            return Decimal("1")

        return utilization


def create_default_window(
    *,
    max_characters: int | None = None,
    max_tokens: int | None = None,
    characters_per_token: float = 4.0,
) -> ContextWindow:
    """Create a context window manager."""
    return ContextWindow(
        max_characters=max_characters,
        max_tokens=max_tokens,
        characters_per_token=characters_per_token,
    )


__all__ = [
    "ContextWindowResult",
    "ContextWindow",
    "create_default_window",
]
