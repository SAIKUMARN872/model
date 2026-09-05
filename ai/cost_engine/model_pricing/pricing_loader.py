"""
Pricing catalog loader.
"""

from __future__ import annotations

import json
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable

from .models import ModelPricing, TokenPricing
from .pricing_version import (
    PricingVersion,
    PricingVersionManager,
)


class PricingLoaderError(ValueError):
    """Raised when pricing data cannot be loaded."""


class PricingLoader:
    """
    Loads model pricing definitions.

    Supported sources:

    - Python dictionaries
    - JSON strings
    - JSON files
    """

    def __init__(
        self,
        version_manager: PricingVersionManager | None = None,
    ) -> None:

        self.version_manager = (
            version_manager
            or PricingVersionManager()
        )

    def from_dict(
        self,
        data: dict[str, Any],
    ) -> list[ModelPricing]:

        if not isinstance(data, dict):
            raise PricingLoaderError(
                "Pricing data must be a dictionary"
            )

        version_data = data.get("version")

        if isinstance(version_data, dict):
            version = PricingVersion(
                version=str(
                    version_data.get(
                        "version",
                        "1.0.0",
                    )
                ),
                description=str(
                    version_data.get(
                        "description",
                        "",
                    )
                ),
                active=bool(
                    version_data.get(
                        "active",
                        True,
                    )
                ),
            )

            self.version_manager.register(
                version
            )

            version_name = version.version

        else:
            version_name = str(
                version_data or "1.0.0"
            )

        models = data.get("models", [])

        if not isinstance(models, list):
            raise PricingLoaderError(
                "'models' must be a list"
            )

        return [
            self._parse_model(
                item,
                version_name,
            )
            for item in models
        ]

    def from_json(
        self,
        content: str,
    ) -> list[ModelPricing]:

        try:
            data = json.loads(content)
        except json.JSONDecodeError as exc:
            raise PricingLoaderError(
                f"Invalid JSON: {exc}"
            ) from exc

        return self.from_dict(data)

    def from_file(
        self,
        path: str | Path,
    ) -> list[ModelPricing]:

        path = Path(path)

        if not path.exists():
            raise FileNotFoundError(
                f"Pricing file not found: {path}"
            )

        content = path.read_text(
            encoding="utf-8"
        )

        return self.from_json(content)

    def load(
        self,
        source: Any,
    ) -> list[ModelPricing]:

        if isinstance(source, dict):
            return self.from_dict(source)

        if isinstance(source, str):

            stripped = source.strip()

            if stripped.startswith("{"):
                return self.from_json(
                    stripped
                )

            return self.from_file(source)

        if isinstance(
            source,
            (Path,),
        ):
            return self.from_file(source)

        raise PricingLoaderError(
            "Unsupported pricing source"
        )

    def _parse_model(
        self,
        data: dict[str, Any],
        version: str,
    ) -> ModelPricing:

        if not isinstance(data, dict):
            raise PricingLoaderError(
                "Each model definition must be a dictionary"
            )

        model = data.get("model")
        provider = data.get("provider")

        if not model:
            raise PricingLoaderError(
                "Model name is required"
            )

        if not provider:
            raise PricingLoaderError(
                f"Provider is required for model: {model}"
            )

        token_data = data.get(
            "token_pricing",
            {},
        )

        if not isinstance(token_data, dict):
            raise PricingLoaderError(
                f"Invalid token_pricing for model: {model}"
            )

        token_pricing = TokenPricing(
            input_cost_per_1k=Decimal(
                str(
                    token_data.get(
                        "input_cost_per_1k",
                        0,
                    )
                )
            ),
            output_cost_per_1k=Decimal(
                str(
                    token_data.get(
                        "output_cost_per_1k",
                        0,
                    )
                )
            ),
            cached_input_cost_per_1k=Decimal(
                str(
                    token_data.get(
                        "cached_input_cost_per_1k",
                        0,
                    )
                )
            ),
            reasoning_cost_per_1k=Decimal(
                str(
                    token_data.get(
                        "reasoning_cost_per_1k",
                        0,
                    )
                )
            ),
            currency=str(
                token_data.get(
                    "currency",
                    data.get(
                        "currency",
                        "USD",
                    ),
                )
            ),
        )

        effective_from = self._parse_datetime(
            data.get("effective_from")
        )

        effective_until = self._parse_optional_datetime(
            data.get("effective_until")
        )

        return ModelPricing(
            model=str(model),
            provider=str(provider),
            token_pricing=token_pricing,
            version=str(
                data.get(
                    "version",
                    version,
                )
            ),
            effective_from=effective_from,
            effective_until=effective_until,
            request_cost=Decimal(
                str(
                    data.get(
                        "request_cost",
                        0,
                    )
                )
            ),
            currency=str(
                data.get(
                    "currency",
                    token_pricing.currency,
                )
            ),
            metadata=data.get(
                "metadata",
                {},
            ),
        )

    @staticmethod
    def _parse_datetime(
        value: Any,
    ) -> datetime:

        if value is None:
            from datetime import timezone

            return datetime.now(timezone.utc)

        if isinstance(value, datetime):
            return value

        try:
            return datetime.fromisoformat(
                str(value).replace(
                    "Z",
                    "+00:00",
                )
            )
        except ValueError as exc:
            raise PricingLoaderError(
                f"Invalid datetime: {value}"
            ) from exc

    @staticmethod
    def _parse_optional_datetime(
        value: Any,
    ) -> datetime | None:

        if value is None:
            return None

        return PricingLoader._parse_datetime(
            value
        )