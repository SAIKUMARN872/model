from __future__ import annotations

from decimal import Decimal
from typing import Optional

from ai.model_registry.engine import ModelRegistryEngine

from .interfaces import PricingProvider
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


class ModelRegistryPricingProvider(PricingProvider):
    """Read canonical model pricing directly from the Model Registry."""

    def __init__(
        self,
        registry: ModelRegistryEngine,
    ) -> None:
        self.registry = registry

    def get_pricing(
        self,
        model: str,
        provider: str,
    ) -> Optional[ModelPricing]:
        record = self.registry.get(
            provider=provider,
            model_id=model,
        )

        if record is None:
            return None

        pricing = record.pricing

        return ModelPricing(
            model=record.model_id,
            provider=record.provider,
            input_cost_per_1k_tokens=(
                Decimal(str(pricing.input_per_1m_tokens))
                / Decimal("1000")
            ),
            output_cost_per_1k_tokens=(
                Decimal(str(pricing.output_per_1m_tokens))
                / Decimal("1000")
            ),
            currency=pricing.currency,
            pricing_version=record.version or "1.0",
        )


__all__ = [
    "ModelPricingProvider",
    "ModelRegistryPricingProvider",
]
