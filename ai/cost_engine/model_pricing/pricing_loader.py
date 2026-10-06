from __future__ import annotations

import json
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from .models import PricingEntry
from .pricing import PricingService
from .pricing_rules import validate_pricing


class PricingLoader:
    """Load and validate model pricing from JSON files."""

    REQUIRED_FIELDS = (
        "model",
        "provider",
        "input_cost_per_1k_tokens",
        "output_cost_per_1k_tokens",
    )

    def load_entries(self, file_path: str | Path) -> list[PricingEntry]:
        path = Path(file_path)

        try:
            with path.open("r", encoding="utf-8") as file:
                data = json.load(file)
        except FileNotFoundError as exc:
            raise FileNotFoundError(
                f"Pricing file not found: {path}"
            ) from exc
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Invalid JSON in pricing file: {path}"
            ) from exc

        if isinstance(data, dict):
            records = data.get("pricing")

            if not isinstance(records, list):
                raise ValueError(
                    "Pricing JSON object must contain a 'pricing' list"
                )
        elif isinstance(data, list):
            records = data
        else:
            raise ValueError(
                "Pricing JSON must be a list or an object containing 'pricing'"
            )

        entries: list[PricingEntry] = []

        for index, record in enumerate(records):
            if not isinstance(record, dict):
                raise ValueError(
                    f"Pricing entry at index {index} must be an object"
                )

            missing = [
                field
                for field in self.REQUIRED_FIELDS
                if field not in record
            ]
            if missing:
                raise ValueError(
                    f"Pricing entry {index} is missing fields: {missing}"
                )

            try:
                entry = PricingEntry(
                    model=str(record["model"]),
                    provider=str(record["provider"]),
                    input_cost_per_1k_tokens=Decimal(
                        str(record["input_cost_per_1k_tokens"])
                    ),
                    output_cost_per_1k_tokens=Decimal(
                        str(record["output_cost_per_1k_tokens"])
                    ),
                    currency=str(record.get("currency", "USD")),
                    version=str(record.get("version", "1.0")),
                    effective_from=record.get("effective_from"),
                    metadata=record.get("metadata", {}),
                )
                validate_pricing(entry)
            except (InvalidOperation, TypeError, ValueError) as exc:
                raise ValueError(
                    f"Invalid pricing entry at index {index}: {exc}"
                ) from exc

            entries.append(entry)

        return entries

    def load_into(
        self,
        file_path: str | Path,
        service: PricingService,
    ) -> int:
        """Validate all entries, then register them."""
        entries = self.load_entries(file_path)

        # Validate the entire file before changing the service.
        for entry in entries:
            validate_pricing(entry)

        service.register_many(entries)
        return len(entries)


__all__ = ["PricingLoader"]
