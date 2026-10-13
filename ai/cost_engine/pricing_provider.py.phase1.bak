from __future__ import annotations

from typing import Optional

from .interfaces import PricingProvider
from .model_pricing.models import PricingEntry
from .model_pricing.pricing import PricingService
from .models import ModelPricing


class ModelPricingProvider(PricingProvider):
    """Adapts ModelNow PricingService to the Cost Engine interface."""

    def __init__(self, pricing_service: PricingService) -> None:
        self.pricing_service = pricing_service

    def get_pricing(
        self,
        model: str,
        provider: str,
    ) -> Optional[ModelPricing]:
        entry = self.pricing_service.get(
            model=model,
            provider=provider,
        )

        if entry is None:
            return None

        return ModelPricing(
            model=entry.model,
            provider=entry.provider,
            input_cost_per_1k_tokens=entry.input_cost_per_1k_tokens,
            output_cost_per_1k_tokens=entry.output_cost_per_1k_tokens,
            currency=entry.currency,
            pricing_version=entry.version,
        )


__all__ = ["ModelPricingProvider"]
