from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict


@dataclass(frozen=True)
class PricingEntry:
    model: str
    provider: str
    input_cost_per_1k_tokens: Decimal
    output_cost_per_1k_tokens: Decimal
    currency: str = "USD"
    version: str = "1.0"
    effective_from: str | None = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def key(self) -> tuple[str, str]:
        return (
            self.provider.strip().lower(),
            self.model.strip().lower(),
        )


@dataclass(frozen=True)
class PricingCatalog:
    entries: tuple[PricingEntry, ...] = ()

    def get(
        self,
        model: str,
        provider: str,
    ) -> PricingEntry | None:
        key = (
            provider.strip().lower(),
            model.strip().lower(),
        )

        for entry in self.entries:
            if entry.key == key:
                return entry

        return None

    def add(self, entry: PricingEntry) -> "PricingCatalog":
        existing = [
            item
            for item in self.entries
            if item.key != entry.key
        ]

        return PricingCatalog(
            entries=tuple(existing) + (entry,)
        )

    def __len__(self) -> int:
        return len(self.entries)
