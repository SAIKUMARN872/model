from __future__ import annotations

from decimal import Decimal

from .models import PricingEntry


def validate_pricing(entry: PricingEntry) -> PricingEntry:
    """Validate a pricing entry before registration."""
    if not entry.model or not entry.model.strip():
        raise ValueError("Model name cannot be empty")

    if not entry.provider or not entry.provider.strip():
        raise ValueError("Provider name cannot be empty")

    if not isinstance(entry.input_cost_per_1k_tokens, Decimal):
        raise TypeError("Input token price must be a Decimal")

    if not isinstance(entry.output_cost_per_1k_tokens, Decimal):
        raise TypeError("Output token price must be a Decimal")

    if not entry.input_cost_per_1k_tokens.is_finite():
        raise ValueError("Input token price must be finite")

    if not entry.output_cost_per_1k_tokens.is_finite():
        raise ValueError("Output token price must be finite")

    if entry.input_cost_per_1k_tokens < Decimal("0"):
        raise ValueError("Input token price cannot be negative")

    if entry.output_cost_per_1k_tokens < Decimal("0"):
        raise ValueError("Output token price cannot be negative")

    if len(entry.currency.strip()) != 3:
        raise ValueError("Currency must be a three-letter code")

    if not entry.version or not entry.version.strip():
        raise ValueError("Pricing version cannot be empty")

    return entry


def is_pricing_available(
    entry: PricingEntry | None,
) -> bool:
    """Return whether a pricing entry is available."""
    return entry is not None


__all__ = ["validate_pricing", "is_pricing_available"]
