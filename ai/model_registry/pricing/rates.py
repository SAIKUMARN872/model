from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PricingRate:
    """
    Normalized token pricing for a model.

    Values represent cost per one million tokens.
    """

    input_per_1m_tokens: float = 0.0
    output_per_1m_tokens: float = 0.0
    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.input_per_1m_tokens < 0:
            raise ValueError(
                "input pricing cannot be negative"
            )

        if self.output_per_1m_tokens < 0:
            raise ValueError(
                "output pricing cannot be negative"
            )

        if not self.currency.strip():
            raise ValueError(
                "currency cannot be empty"
            )


@dataclass(frozen=True)
class TokenUsage:
    input_tokens: int = 0
    output_tokens: int = 0

    def __post_init__(self) -> None:
        if self.input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if self.output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )


__all__ = [
    "PricingRate",
    "TokenUsage",
]
