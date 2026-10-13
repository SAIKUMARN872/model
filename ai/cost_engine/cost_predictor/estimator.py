from __future__ import annotations

from decimal import Decimal

from ..model_pricing.pricing import PricingService
from .features import extract_features
from .models import CostEstimate, CostPredictionRequest
from .models import CostPrediction


class CostEstimator:
    """Estimates request cost using registered model pricing."""

    def __init__(
        self,
        pricing_service: PricingService,
    ) -> None:
        self.pricing_service = pricing_service

    def predict(
        self,
        request: CostPredictionRequest,
    ) -> CostPrediction:
        """Predict the total cost of a request."""

        features = extract_features(request)

        pricing = self.pricing_service.require(
            model=request.model,
            provider=request.provider,
        )

        input_cost = (
            Decimal(features.input_tokens)
            / Decimal("1000")
            * pricing.input_cost_per_1k_tokens
        )

        output_cost = (
            Decimal(features.expected_output_tokens)
            / Decimal("1000")
            * pricing.output_cost_per_1k_tokens
        )

        total_cost = input_cost + output_cost

        return CostPrediction(
            model=request.model,
            provider=request.provider,
            input_tokens=features.input_tokens,
            expected_output_tokens=(
                features.expected_output_tokens
            ),
            predicted_input_cost=input_cost,
            predicted_output_cost=output_cost,
            predicted_total_cost=total_cost,
            currency=pricing.currency,
            request_id=request.request_id,
            metadata=request.metadata,
        )

    def estimate_range(
        self,
        request: CostPredictionRequest,
        minimum_output_tokens: int,
        maximum_output_tokens: int,
    ) -> CostEstimate:
        """Estimate a minimum, expected, and maximum cost range."""

        if minimum_output_tokens < 0:
            raise ValueError(
                "minimum_output_tokens cannot be negative"
            )

        if maximum_output_tokens < minimum_output_tokens:
            raise ValueError(
                "maximum_output_tokens cannot be less than "
                "minimum_output_tokens"
            )

        minimum_request = CostPredictionRequest(
            model=request.model,
            provider=request.provider,
            input_tokens=request.input_tokens,
            expected_output_tokens=minimum_output_tokens,
            request_id=request.request_id,
            metadata=request.metadata,
        )

        maximum_request = CostPredictionRequest(
            model=request.model,
            provider=request.provider,
            input_tokens=request.input_tokens,
            expected_output_tokens=maximum_output_tokens,
            request_id=request.request_id,
            metadata=request.metadata,
        )

        minimum_prediction = self.predict(
            minimum_request
        )

        expected_prediction = self.predict(request)

        maximum_prediction = self.predict(
            maximum_request
        )

        return CostEstimate(
            minimum_cost=(
                minimum_prediction.predicted_total_cost
            ),
            expected_cost=(
                expected_prediction.predicted_total_cost
            ),
            maximum_cost=(
                maximum_prediction.predicted_total_cost
            ),
            currency=expected_prediction.currency,
            confidence=Decimal("1"),
            metadata=request.metadata,
        )


__all__ = [
    "CostEstimator",
]
