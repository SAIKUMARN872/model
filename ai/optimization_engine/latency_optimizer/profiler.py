from __future__ import annotations

from decimal import Decimal
from statistics import mean
from typing import Dict, List, Tuple

from .interfaces import LatencyProfilerInterface
from .models import LatencyProfile
from .utils import validate_latency


class LatencyProfiler(
    LatencyProfilerInterface
):
    """Collect and summarize observed model latency."""

    def __init__(self) -> None:
        self._samples: Dict[
            Tuple[str, str],
            List[Decimal],
        ] = {}

    def record(
        self,
        model: str,
        provider: str,
        latency_ms: Decimal | int | float | str,
    ) -> LatencyProfile:
        """Record one latency measurement."""
        value = validate_latency(latency_ms)

        key = self._key(
            model,
            provider,
        )

        self._samples.setdefault(
            key,
            [],
        ).append(value)

        return self.profile(
            model,
            provider,
        )

    def profile(
        self,
        model: str,
        provider: str,
    ) -> LatencyProfile:
        """Return the current latency profile."""
        key = self._key(
            model,
            provider,
        )

        samples = self._samples.get(
            key,
            [],
        )

        if not samples:
            raise ValueError(
                "No latency samples available."
            )

        average_latency = Decimal(
            str(mean(samples))
        )

        return LatencyProfile(
            model=model,
            provider=provider,
            latency_ms=average_latency,
            sample_count=len(samples),
        )

    def samples(
        self,
        model: str,
        provider: str,
    ) -> List[Decimal]:
        """Return recorded latency samples."""
        key = self._key(
            model,
            provider,
        )

        return list(
            self._samples.get(
                key,
                [],
            )
        )

    def sample_count(
        self,
        model: str,
        provider: str,
    ) -> int:
        """Return the number of recorded samples."""
        return len(
            self._samples.get(
                self._key(model, provider),
                [],
            )
        )

    def clear(
        self,
        model: str | None = None,
        provider: str | None = None,
    ) -> None:
        """Clear all samples or one model/provider pair."""
        if model is None and provider is None:
            self._samples.clear()
            return

        if model is None or provider is None:
            raise ValueError(
                "model and provider must both be provided."
            )

        self._samples.pop(
            self._key(model, provider),
            None,
        )

    def size(self) -> int:
        """Return the number of profiled model/provider pairs."""
        return len(self._samples)

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


def create_default_latency_profiler() -> LatencyProfiler:
    """Create the default latency profiler."""
    return LatencyProfiler()


__all__ = [
    "LatencyProfiler",
    "create_default_latency_profiler",
]
