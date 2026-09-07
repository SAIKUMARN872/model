from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Iterable, Mapping

from .estimator import (
    CostEstimate,
    CostEstimator,
)
from .utils import round_cost


@dataclass(frozen=True)
class Prediction:
    """Final cost prediction."""

    model: str

    estimated_input_tokens: int
    estimated_output_tokens: int
    estimated_total_tokens: int

    base_cost: Decimal
    safety_margin: Decimal
    estimated_cost: Decimal

    currency: str

    pricing_available: bool

    metadata: dict[str, Any]


class CostPredictor:
    """
    High-level cost prediction service.

    This is the component that other Cost Engine modules
    should normally call.
    """

    def __init__(
        self,
        estimator: CostEstimator | None = None,
        default_safety_margin_percent: Decimal = Decimal("10"),
    ) -> None:

        if default_safety_margin_percent < 0:
            raise ValueError(
                "Safety margin cannot be negative"
            )

        self.estimator = (
            estimator or CostEstimator()
        )

        self.default_safety_margin_percent = (
            default_safety_margin_percent
        )

    def predict(
        self,
        model: str,
        prompt: str | None = None,
        messages: Iterable[Mapping[str, Any]] | None = None,
        max_output_tokens: int | None = None,
        expected_output: str | None = None,
        safety_margin_percent: Decimal | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Prediction:

        estimate = self.estimator.estimate(
            model=model,
            prompt=prompt,
            messages=messages,
            max_output_tokens=max_output_tokens,
            expected_output=expected_output,
            metadata=metadata,
        )

        margin_percent = (
            self.default_safety_margin_percent
            if safety_margin_percent is None
            else Decimal(str(safety_margin_percent))
        )

        if margin_percent < 0:
            raise ValueError(
                "Safety margin cannot be negative"
            )

        return self._build_prediction(
            estimate,
            margin_percent,
        )

    def predict_from_tokens(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        safety_margin_percent: Decimal | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Prediction:

        estimate = self.estimator.estimate_from_tokens(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            metadata=metadata,
        )

        margin_percent = (
            self.default_safety_margin_percent
            if safety_margin_percent is None
            else Decimal(str(safety_margin_percent))
        )

        if margin_percent < 0:
            raise ValueError(
                "Safety margin cannot be negative"
            )

        return self._build_prediction(
            estimate,
            margin_percent,
        )

    def _build_prediction(
        self,
        estimate: CostEstimate,
        margin_percent: Decimal,
    ) -> Prediction:

        base_cost = Decimal(
            estimate.total_cost
        )

        margin = (
            base_cost
            * margin_percent
            / Decimal("100")
        )

        estimated_cost = (
            base_cost + margin
        )

        return Prediction(
            model=estimate.model,
            estimated_input_tokens=(
                estimate.input_tokens
            ),
            estimated_output_tokens=(
                estimate.output_tokens
            ),
            estimated_total_tokens=(
                estimate.total_tokens
            ),
            base_cost=round_cost(base_cost),
            safety_margin=round_cost(margin),
            estimated_cost=round_cost(
                estimated_cost
            ),
            currency=estimate.currency,
            pricing_available=(
                estimate.pricing_available
            ),
            metadata={
                **estimate.metadata,
                "safety_margin_percent": str(
                    margin_percent
                ),
            },
        )