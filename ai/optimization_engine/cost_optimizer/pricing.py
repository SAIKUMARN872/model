"""Pricing utilities for the ModelNow cost optimizer."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, Tuple

from .utils import to_decimal, validate_cost


@dataclass(frozen=True)
class ModelPricing:
    """Pricing definition for a model/provider route."""

    model: str
    provider: str
    input_cost_per_1k_tokens: Decimal = Decimal("0")
    output_cost_per_1k_tokens: Decimal = Decimal("0")
    request_cost: Decimal = Decimal("0")
    currency: str = "USD"

    def __post_init__(self) -> None:
        if not self.model or not self.model.strip():
            raise ValueError("model must not be empty")

        if not self.provider or not self.provider.strip():
            raise ValueError("provider must not be empty")

        object.__setattr__(
            self,
            "input_cost_per_1k_tokens",
            validate_cost(self.input_cost_per_1k_tokens),
        )
        object.__setattr__(
            self,
            "output_cost_per_1k_tokens",
            validate_cost(self.output_cost_per_1k_tokens),
        )
        object.__setattr__(
            self,
            "request_cost",
            validate_cost(self.request_cost),
        )

        if not self.currency or not self.currency.strip():
            raise ValueError("currency must not be empty")

    @property
    def key(self) -> Tuple[str, str]:
        """Return the model/provider lookup key."""
        return self.model, self.provider

    def calculate_cost(
        self,
        input_tokens: int = 0,
        output_tokens: int = 0,
    ) -> Decimal:
        """Calculate total request cost from token usage."""
        if not isinstance(input_tokens, int) or input_tokens < 0:
            raise ValueError(
                "input_tokens must be a non-negative integer"
            )

        if not isinstance(output_tokens, int) or output_tokens < 0:
            raise ValueError(
                "output_tokens must be a non-negative integer"
            )

        input_cost = (
            Decimal(input_tokens) / Decimal("1000")
        ) * self.input_cost_per_1k_tokens

        output_cost = (
            Decimal(output_tokens) / Decimal("1000")
        ) * self.output_cost_per_1k_tokens

        return (
            self.request_cost
            + input_cost
            + output_cost
        )

    def as_dict(self) -> dict[str, object]:
        """Serialize pricing information."""
        return {
            "model": self.model,
            "provider": self.provider,
            "input_cost_per_1k_tokens": str(
                self.input_cost_per_1k_tokens
            ),
            "output_cost_per_1k_tokens": str(
                self.output_cost_per_1k_tokens
            ),
            "request_cost": str(self.request_cost),
            "currency": self.currency,
        }


class PricingRegistry:
    """In-memory registry of model/provider pricing."""

    def __init__(
        self,
        pricing: list[ModelPricing] | None = None,
    ) -> None:
        self._pricing: Dict[
            Tuple[str, str],
            ModelPricing,
        ] = {}

        for item in pricing or []:
            self.register(item)

    def register(self, pricing: ModelPricing) -> None:
        """Register or replace a pricing definition."""
        if not isinstance(pricing, ModelPricing):
            raise TypeError(
                "pricing must be a ModelPricing instance"
            )

        self._pricing[pricing.key] = pricing

    def get(
        self,
        model: str,
        provider: str,
    ) -> ModelPricing:
        """Return pricing for a model/provider route."""
        key = (model, provider)

        try:
            return self._pricing[key]
        except KeyError as exc:
            raise KeyError(
                f"No pricing registered for {model}/{provider}"
            ) from exc

    def find(
        self,
        model: str,
        provider: str,
    ) -> ModelPricing | None:
        """Return pricing or None when unavailable."""
        return self._pricing.get((model, provider))

    def remove(
        self,
        model: str,
        provider: str,
    ) -> bool:
        """Remove pricing and report whether it existed."""
        return self._pricing.pop(
            (model, provider),
            None,
        ) is not None

    def clear(self) -> None:
        """Remove all pricing definitions."""
        self._pricing.clear()

    @property
    def pricing(self) -> list[ModelPricing]:
        """Return registered pricing definitions."""
        return list(self._pricing.values())

    def __len__(self) -> int:
        return len(self._pricing)


def calculate_token_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1k_tokens: Decimal | int | float | str,
    output_cost_per_1k_tokens: Decimal | int | float | str,
) -> Decimal:
    """Calculate token-based cost without a request fee."""
    pricing = ModelPricing(
        model="_",
        provider="_",
        input_cost_per_1k_tokens=to_decimal(
            input_cost_per_1k_tokens
        ),
        output_cost_per_1k_tokens=to_decimal(
            output_cost_per_1k_tokens
        ),
    )

    return pricing.calculate_cost(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )


__all__ = [
    "ModelPricing",
    "PricingRegistry",
    "calculate_token_cost",
]
