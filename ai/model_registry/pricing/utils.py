from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord
from .pricing import ModelCost
from .rates import PricingRate


def pricing_rate_from_model(
    model: ModelRecord,
) -> PricingRate:
    if not isinstance(model, ModelRecord):
        raise TypeError(
            "model must be a ModelRecord"
        )

    return PricingRate(
        input_per_1m_tokens=(
            model.pricing.input_per_1m_tokens
        ),
        output_per_1m_tokens=(
            model.pricing.output_per_1m_tokens
        ),
        currency=model.pricing.currency,
    )


def cheapest_models(
    models: Iterable[ModelRecord],
) -> list[ModelRecord]:
    """
    Sort models by combined input/output token price.
    """

    return sorted(
        models,
        key=lambda model: (
            model.pricing.input_per_1m_tokens
            + model.pricing.output_per_1m_tokens
        ),
    )


def average_cost(
    costs: Iterable[ModelCost],
) -> float:
    values = list(costs)

    if not values:
        return 0.0

    return sum(
        item.total_cost
        for item in values
    ) / len(values)


def total_cost(
    costs: Iterable[ModelCost],
) -> float:
    return sum(
        item.total_cost
        for item in costs
    )


__all__ = [
    "pricing_rate_from_model",
    "cheapest_models",
    "average_cost",
    "total_cost",
]
