from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class LatencyAcceleration:
    """Latency acceleration recommendation."""

    model: str
    provider: str
    estimated_latency_ms: Decimal
    accelerated_latency_ms: Decimal
    reduction_ms: Decimal
    reduction_percentage: Decimal
    strategy: str
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


class LatencyAccelerator:
    """Apply latency acceleration strategies."""

    def __init__(
        self,
        strategies: Optional[
            Dict[str, Decimal | int | float | str]
        ] = None,
    ) -> None:
        self._strategies: Dict[str, Decimal] = {}

        if strategies:
            for name, reduction in strategies.items():
                self.register_strategy(
                    name,
                    reduction,
                )

    def register_strategy(
        self,
        strategy: str,
        reduction_percentage: Decimal | int | float | str,
    ) -> None:
        """Register a latency reduction strategy."""
        if not isinstance(strategy, str) or not strategy.strip():
            raise ValueError(
                "strategy must be a non-empty string"
            )

        reduction = Decimal(
            str(reduction_percentage)
        )

        if reduction < Decimal("0"):
            raise ValueError(
                "reduction_percentage must not be negative"
            )

        if reduction > Decimal("100"):
            raise ValueError(
                "reduction_percentage must not exceed 100"
            )

        self._strategies[
            strategy.strip().lower()
        ] = reduction

    def accelerate(
        self,
        model: str,
        provider: str,
        latency_ms: Decimal | int | float | str,
        strategy: str,
    ) -> LatencyAcceleration:
        """Apply a registered acceleration strategy."""
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

        latency = Decimal(str(latency_ms))

        if latency < Decimal("0"):
            raise ValueError(
                "latency_ms must not be negative"
            )

        key = strategy.strip().lower()

        if key not in self._strategies:
            raise ValueError(
                f"Unknown acceleration strategy: {strategy}"
            )

        reduction_percentage = self._strategies[key]

        reduction_ms = (
            latency
            * reduction_percentage
            / Decimal("100")
        )

        accelerated_latency = (
            latency - reduction_ms
        )

        return LatencyAcceleration(
            model=model,
            provider=provider,
            estimated_latency_ms=latency,
            accelerated_latency_ms=accelerated_latency,
            reduction_ms=reduction_ms,
            reduction_percentage=reduction_percentage,
            strategy=key,
        )

    def has_strategy(
        self,
        strategy: str,
    ) -> bool:
        """Check whether a strategy exists."""
        return (
            strategy.strip().lower()
            in self._strategies
        )

    def strategies(self) -> Dict[str, Decimal]:
        """Return registered acceleration strategies."""
        return dict(self._strategies)

    def clear(self) -> None:
        """Remove all acceleration strategies."""
        self._strategies.clear()


def create_default_latency_accelerator() -> LatencyAccelerator:
    """Create the default accelerator."""
    return LatencyAccelerator(
        strategies={
            "cache": Decimal("30"),
            "streaming": Decimal("15"),
            "batch": Decimal("10"),
        }
    )


__all__ = [
    "LatencyAcceleration",
    "LatencyAccelerator",
    "create_default_latency_accelerator",
]
