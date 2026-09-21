from __future__ import annotations

from dataclasses import dataclass

from ..models import ModelPricing, ModelRecord
from .currency import normalize_currency, round_money
from .rates import PricingRate, TokenUsage


@dataclass(frozen=True)
class ModelCost:
    qualified_id: str
    input_cost: float
    output_cost: float
    total_cost: float
    currency: str


class PricingCalculator:
    """
    Calculates model inference cost from normalized token rates.
    """

    def rate_from_model(
        self,
        model: ModelRecord,
    ) -> PricingRate:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        pricing = model.pricing

        return PricingRate(
            input_per_1m_tokens=(
                pricing.input_per_1m_tokens
            ),
            output_per_1m_tokens=(
                pricing.output_per_1m_tokens
            ),
            currency=normalize_currency(
                pricing.currency
            ),
        )

    def calculate(
        self,
        model: ModelRecord,
        usage: TokenUsage,
    ) -> ModelCost:
        rate = self.rate_from_model(model)

        input_cost = (
            usage.input_tokens
            / 1_000_000
            * rate.input_per_1m_tokens
        )

        output_cost = (
            usage.output_tokens
            / 1_000_000
            * rate.output_per_1m_tokens
        )

        total_cost = input_cost + output_cost

        return ModelCost(
            qualified_id=model.qualified_id,
            input_cost=float(
                round_money(input_cost)
            ),
            output_cost=float(
                round_money(output_cost)
            ),
            total_cost=float(
                round_money(total_cost)
            ),
            currency=rate.currency,
        )

    def estimate(
        self,
        model: ModelRecord,
        input_tokens: int,
        output_tokens: int,
    ) -> ModelCost:
        return self.calculate(
            model,
            TokenUsage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            ),
        )


class PricingStore:
    """
    In-memory pricing store keyed by qualified model ID.
    """

    def __init__(
        self,
        models: list[ModelRecord] | None = None,
    ) -> None:
        self._pricing: dict[
            str,
            ModelPricing,
        ] = {}

        for model in models or []:
            self.upsert(model)

    def register(
        self,
        model: ModelRecord,
    ) -> ModelPricing:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        key = model.qualified_id.lower()

        if key in self._pricing:
            raise ValueError(
                f"Pricing already exists: "
                f"{model.qualified_id}"
            )

        self._pricing[key] = model.pricing

        return model.pricing

    def upsert(
        self,
        model: ModelRecord,
    ) -> ModelPricing:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        self._pricing[
            model.qualified_id.lower()
        ] = model.pricing

        return model.pricing

    def get(
        self,
        provider: str,
        model_id: str,
    ) -> ModelPricing | None:
        key = f"{provider}:{model_id}".lower()

        return self._pricing.get(key)

    def get_by_id(
        self,
        qualified_id: str,
    ) -> ModelPricing | None:
        return self._pricing.get(
            qualified_id.strip().lower()
        )

    def remove(
        self,
        provider: str,
        model_id: str,
    ) -> ModelPricing | None:
        return self._pricing.pop(
            f"{provider}:{model_id}".lower(),
            None,
        )

    def clear(self) -> None:
        self._pricing.clear()

    def count(self) -> int:
        return len(self._pricing)


__all__ = [
    "ModelCost",
    "PricingCalculator",
    "PricingStore",
]
