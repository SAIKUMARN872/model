from __future__ import annotations

from decimal import Decimal
from typing import Optional

from ..model_pricing.pricing import PricingService
from .estimator import CostEstimator
from .models import (
    CostEstimate,
    CostPrediction,
    CostPredictionRequest,
)


class CostPredictor:
    """Public cost prediction interface for ModelNow."""

    def __init__(
        self,
        pricing_service: PricingService,
        estimator: Optional[CostEstimator] = None,
    ) -> None:
        self.estimator = (
            estimator
            or CostEstimator(pricing_service)
        )

    def predict(
        self,
        request: CostPredictionRequest,
    ) -> CostPrediction:
        """Predict the cost of a single request."""

        return self.estimator.predict(request)

    def predict_cost(
        self,
        model: str,
        provider: str,
        input_tokens: int,
        expected_output_tokens: int,
        request_id: str | None = None,
    ) -> Decimal:
        """Convenience method returning only predicted total cost."""

        request = CostPredictionRequest(
            model=model,
            provider=provider,
            input_tokens=input_tokens,
            expected_output_tokens=expected_output_tokens,
            request_id=request_id,
        )

        prediction = self.predict(request)

        return prediction.predicted_total_cost

    def estimate_range(
        self,
        request: CostPredictionRequest,
        minimum_output_tokens: int,
        maximum_output_tokens: int,
    ) -> CostEstimate:
        """Estimate a minimum-to-maximum cost range."""

        return self.estimator.estimate_range(
            request=request,
            minimum_output_tokens=minimum_output_tokens,
            maximum_output_tokens=maximum_output_tokens,
        )


__all__ = [
    "CostPredictor",
]
