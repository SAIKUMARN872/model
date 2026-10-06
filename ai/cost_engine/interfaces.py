from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable, Optional

from .models import (
    CostRequest,
    CostResult,
    ModelPricing,
    TokenUsage,
)


class PricingProvider(ABC):
    """Provides pricing information for AI models."""

    @abstractmethod
    def get_pricing(
        self,
        model: str,
        provider: str,
    ) -> Optional[ModelPricing]:
        """Return pricing for a model/provider pair."""
        raise NotImplementedError


class TokenUsageProvider(ABC):
    """Provides token usage information."""

    @abstractmethod
    def get_usage(
        self,
        request: CostRequest,
    ) -> TokenUsage:
        """Return token usage for a request."""
        raise NotImplementedError


class CostCalculator(ABC):
    """Calculates the monetary cost of model usage."""

    @abstractmethod
    def calculate(
        self,
        request: CostRequest,
        pricing: ModelPricing,
    ) -> CostResult:
        """Calculate cost from usage and pricing."""
        raise NotImplementedError


class CostTracker(ABC):
    """Stores and retrieves historical cost records."""

    @abstractmethod
    def record(self, result: CostResult) -> None:
        """Record a calculated cost."""
        raise NotImplementedError

    @abstractmethod
    def get_total_cost(
        self,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ):
        """Return accumulated cost."""
        raise NotImplementedError


class CostEngineInterface(ABC):
    """Public contract implemented by the Cost Engine."""

    @abstractmethod
    def calculate_cost(self, request: CostRequest) -> CostResult:
        """Calculate the cost of a model request."""
        raise NotImplementedError

    @abstractmethod
    def calculate_batch(
        self,
        requests: Iterable[CostRequest],
    ) -> list[CostResult]:
        """Calculate costs for multiple requests."""
        raise NotImplementedError
