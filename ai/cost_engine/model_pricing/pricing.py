from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional

from .models import PricingCatalog, PricingEntry
from .pricing_rules import validate_pricing


class PricingService:
    """Central pricing service for ModelNow."""

    def __init__(
        self,
        catalog: Optional[PricingCatalog] = None,
    ) -> None:
        self._catalog = catalog or PricingCatalog()

        for entry in self._catalog.entries:
            validate_pricing(entry)

    def register(
        self,
        entry: PricingEntry,
    ) -> PricingEntry:
        validate_pricing(entry)
        self._catalog = self._catalog.add(entry)
        return entry

    def register_many(
        self,
        entries: Iterable[PricingEntry],
    ) -> None:
        for entry in entries:
            self.register(entry)

    def get(
        self,
        model: str,
        provider: str,
    ) -> PricingEntry | None:
        return self._catalog.get(model, provider)

    def require(
        self,
        model: str,
        provider: str,
    ) -> PricingEntry:
        entry = self.get(model, provider)

        if entry is None:
            raise LookupError(
                f"No pricing found for "
                f"model='{model}', provider='{provider}'"
            )

        return entry

    def calculate(
        self,
        model: str,
        provider: str,
        input_tokens: int,
        output_tokens: int,
    ) -> Decimal:
        if isinstance(input_tokens, bool) or not isinstance(input_tokens, int):
            raise TypeError("input_tokens must be an integer")

        if isinstance(output_tokens, bool) or not isinstance(output_tokens, int):
            raise TypeError("output_tokens must be an integer")

        if input_tokens < 0 or output_tokens < 0:
            raise ValueError("Token counts cannot be negative")

        pricing = self.require(model, provider)

        input_cost = (
            Decimal(input_tokens)
            / Decimal("1000")
            * pricing.input_cost_per_1k_tokens
        )

        output_cost = (
            Decimal(output_tokens)
            / Decimal("1000")
            * pricing.output_cost_per_1k_tokens
        )

        return input_cost + output_cost

    @property
    def catalog(self) -> PricingCatalog:
        return self._catalog

    @property
    def size(self) -> int:
        return len(self._catalog)


__all__ = ["PricingService"]
