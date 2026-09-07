from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from threading import RLock
from typing import Dict

from .utils import normalize_model_name


@dataclass(frozen=True)
class ModelPricing:
    """
    Pricing per 1,000 tokens.

    input_cost_per_1k:
        Input/prompt token cost.

    output_cost_per_1k:
        Output/completion token cost.
    """

    model: str
    input_cost_per_1k: Decimal
    output_cost_per_1k: Decimal
    currency: str = "USD"

    def __post_init__(self) -> None:

        if self.input_cost_per_1k < 0:
            raise ValueError(
                "input_cost_per_1k cannot be negative"
            )

        if self.output_cost_per_1k < 0:
            raise ValueError(
                "output_cost_per_1k cannot be negative"
            )


class PricingNotFoundError(KeyError):
    """Raised when pricing for a model is unavailable."""


class PricingCache:
    """Thread-safe in-memory model pricing cache."""

    def __init__(self) -> None:
        self._pricing: Dict[str, ModelPricing] = {}
        self._lock = RLock()

    def set(
        self,
        pricing: ModelPricing,
    ) -> None:

        model = normalize_model_name(
            pricing.model
        )

        with self._lock:
            self._pricing[model] = pricing

    def get(
        self,
        model: str,
    ) -> ModelPricing:

        normalized = normalize_model_name(model)

        with self._lock:

            pricing = self._pricing.get(normalized)

            if pricing is None:
                raise PricingNotFoundError(
                    f"No pricing found for model: {model}"
                )

            return pricing

    def get_or_none(
        self,
        model: str,
    ) -> ModelPricing | None:

        try:
            return self.get(model)
        except PricingNotFoundError:
            return None

    def remove(
        self,
        model: str,
    ) -> None:

        normalized = normalize_model_name(model)

        with self._lock:
            self._pricing.pop(
                normalized,
                None,
            )

    def exists(
        self,
        model: str,
    ) -> bool:

        return self.get_or_none(model) is not None

    def all(
        self,
    ) -> Dict[str, ModelPricing]:

        with self._lock:
            return dict(self._pricing)

    def clear(self) -> None:

        with self._lock:
            self._pricing.clear()