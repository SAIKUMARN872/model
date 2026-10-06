from __future__ import annotations

from decimal import Decimal
from typing import Dict, Tuple

from .interfaces import LatencyPredictorInterface
from .utils import validate_latency


class LatencyPredictor(
    LatencyPredictorInterface
):
    """Predict latency using registered historical measurements."""

    def __init__(
        self,
        latency_data: Dict[
            Tuple[str, str],
            Decimal | int | float | str
        ] | None = None,
        default_latency_ms: Decimal | int | float | str = Decimal(
            "100"
        ),
    ) -> None:
        self._latency_data: Dict[
            Tuple[str, str],
            Decimal
        ] = {}

        if latency_data:
            for (
                model,
                provider,
            ), latency in latency_data.items():
                self.register(
                    model=model,
                    provider=provider,
                    latency_ms=latency,
                )

        self.default_latency_ms = validate_latency(
            default_latency_ms
        )

    def register(
        self,
        model: str,
        provider: str,
        latency_ms: Decimal | int | float | str,
    ) -> None:
        """Register a measured latency."""
        key = self._key(
            model,
            provider,
        )

        self._latency_data[key] = validate_latency(
            latency_ms
        )

    def predict(
        self,
        model: str,
        provider: str,
    ) -> Decimal:
        """Return predicted latency."""
        return self._latency_data.get(
            self._key(model, provider),
            self.default_latency_ms,
        )

    def has_prediction(
        self,
        model: str,
        provider: str,
    ) -> bool:
        """Check whether historical latency exists."""
        return (
            self._key(model, provider)
            in self._latency_data
        )

    def remove(
        self,
        model: str,
        provider: str,
    ) -> None:
        """Remove a registered latency prediction."""
        self._latency_data.pop(
            self._key(model, provider),
            None,
        )

    def clear(self) -> None:
        """Clear all registered latency data."""
        self._latency_data.clear()

    def size(self) -> int:
        """Return the number of registered predictions."""
        return len(self._latency_data)

    @staticmethod
    def _key(
        model: str,
        provider: str,
    ) -> Tuple[str, str]:
        if not isinstance(model, str) or not model.strip():
            raise ValueError(
                "model must be a non-empty string"
            )

        if (
            not isinstance(provider, str)
            or not provider.strip()
        ):
            raise ValueError(
                "provider must be a non-empty string"
            )

        return (
            provider.strip().lower(),
            model.strip().lower(),
        )


def create_default_latency_predictor(
    default_latency_ms: Decimal | int | float | str = Decimal(
        "100"
    ),
) -> LatencyPredictor:
    """Create the default latency predictor."""
    return LatencyPredictor(
        default_latency_ms=default_latency_ms
    )


__all__ = [
    "LatencyPredictor",
    "create_default_latency_predictor",
]
