"""Cost prediction utilities for the ModelNow cost optimizer."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from .pricing import ModelPricing, PricingRegistry


@dataclass(frozen=True)
class CostPrediction:
    """Predicted cost for a model/provider request."""

    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    estimated_cost: Decimal
    currency: str = "USD"
    metadata: dict[str, Any] | None = None

    def as_dict(self) -> dict[str, Any]:
        """Serialize the prediction."""
        return {
            "model": self.model,
            "provider": self.provider,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "estimated_cost": str(self.estimated_cost),
            "currency": self.currency,
            "metadata": dict(self.metadata or {}),
        }


class CostPredictor:
    """Estimate request costs using registered model pricing."""

    def __init__(
        self,
        registry: PricingRegistry | None = None,
    ) -> None:
        self.registry = (
            registry
            if registry is not None
            else PricingRegistry()
        )

    def predict(
        self,
        model: str,
        provider: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> CostPrediction:
        """Predict the cost of a model/provider request."""
        if not model or not model.strip():
            raise ValueError("model must not be empty")

        if not provider or not provider.strip():
            raise ValueError("provider must not be empty")

        self._validate_tokens(
            input_tokens,
            "input_tokens",
        )
        self._validate_tokens(
            output_tokens,
            "output_tokens",
        )

        pricing = self.registry.get(
            model,
            provider,
        )

        estimated_cost = pricing.calculate_cost(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )

        return CostPrediction(
            model=model,
            provider=provider,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            estimated_cost=estimated_cost,
            currency=pricing.currency,
            metadata=dict(metadata or {}),
        )

    def predict_with_pricing(
        self,
        pricing: ModelPricing,
        input_tokens: int = 0,
        output_tokens: int = 0,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> CostPrediction:
        """Predict cost directly from a pricing definition."""
        if not isinstance(pricing, ModelPricing):
            raise TypeError(
                "pricing must be a ModelPricing instance"
            )

        self._validate_tokens(
            input_tokens,
            "input_tokens",
        )
        self._validate_tokens(
            output_tokens,
            "output_tokens",
        )

        return CostPrediction(
            model=pricing.model,
            provider=pricing.provider,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            estimated_cost=pricing.calculate_cost(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            ),
            currency=pricing.currency,
            metadata=dict(metadata or {}),
        )

    def predict_many(
        self,
        requests: list[dict[str, Any]],
    ) -> list[CostPrediction]:
        """Predict costs for multiple requests."""
        if not isinstance(requests, list):
            raise TypeError("requests must be a list")

        predictions: list[CostPrediction] = []

        for request in requests:
            if not isinstance(request, dict):
                raise TypeError(
                    "each request must be a dictionary"
                )

            predictions.append(
                self.predict(**request)
            )

        return predictions

    @staticmethod
    def total_cost(
        predictions: list[CostPrediction],
    ) -> Decimal:
        """Calculate the total estimated cost."""
        if not isinstance(predictions, list):
            raise TypeError(
                "predictions must be a list"
            )

        total = Decimal("0")

        for prediction in predictions:
            if not isinstance(
                prediction,
                CostPrediction,
            ):
                raise TypeError(
                    "predictions must contain "
                    "CostPrediction instances"
                )

            total += prediction.estimated_cost

        return total

    @staticmethod
    def _validate_tokens(
        value: int,
        name: str,
    ) -> None:
        if not isinstance(value, int) or isinstance(value, bool):
            raise ValueError(
                f"{name} must be a non-negative integer"
            )

        if value < 0:
            raise ValueError(
                f"{name} must be a non-negative integer"
            )


def create_cost_predictor(
    pricing: list[ModelPricing] | None = None,
) -> CostPredictor:
    """Create a cost predictor with optional pricing."""
    return CostPredictor(
        PricingRegistry(pricing)
    )


__all__ = [
    "CostPrediction",
    "CostPredictor",
    "create_cost_predictor",
]
