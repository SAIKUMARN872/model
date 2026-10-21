from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Iterable, Optional

from .profiler import PerformanceProfile


def _to_decimal(value: Any) -> Decimal:
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal("0")


@dataclass(frozen=True)
class PerformanceSnapshot:
    """Aggregated performance statistics for a group of executions."""

    sample_count: int = 0
    successful_count: int = 0
    failed_count: int = 0

    average_latency_ms: Decimal = Decimal("0")
    average_time_to_first_token_ms: Decimal = Decimal("0")
    average_throughput_tokens_per_second: Decimal = Decimal("0")

    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_tokens: int = 0

    success_rate: Decimal = Decimal("0")
    error_rate: Decimal = Decimal("0")

    @classmethod
    def from_profiles(
        cls,
        profiles: Iterable[PerformanceProfile],
    ) -> "PerformanceSnapshot":
        values = list(profiles)

        if not values:
            return cls()

        count = len(values)
        successful = sum(1 for profile in values if profile.success)
        failed = count - successful

        total_latency = sum(
            (_to_decimal(profile.latency_ms) for profile in values),
            Decimal("0"),
        )
        total_ttft = sum(
            (
                _to_decimal(profile.time_to_first_token_ms)
                for profile in values
            ),
            Decimal("0"),
        )
        total_throughput = sum(
            (
                _to_decimal(
                    profile.throughput_tokens_per_second
                )
                for profile in values
            ),
            Decimal("0"),
        )

        input_tokens = sum(
            max(0, profile.input_tokens)
            for profile in values
        )
        output_tokens = sum(
            max(0, profile.output_tokens)
            for profile in values
        )
        total_tokens = sum(
            max(0, profile.total_tokens)
            for profile in values
        )

        return cls(
            sample_count=count,
            successful_count=successful,
            failed_count=failed,
            average_latency_ms=total_latency / Decimal(count),
            average_time_to_first_token_ms=(
                total_ttft / Decimal(count)
            ),
            average_throughput_tokens_per_second=(
                total_throughput / Decimal(count)
            ),
            total_input_tokens=input_tokens,
            total_output_tokens=output_tokens,
            total_tokens=total_tokens,
            success_rate=(
                Decimal(successful) / Decimal(count)
            ),
            error_rate=(
                Decimal(failed) / Decimal(count)
            ),
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "sample_count": self.sample_count,
            "successful_count": self.successful_count,
            "failed_count": self.failed_count,
            "average_latency_ms": str(
                self.average_latency_ms
            ),
            "average_time_to_first_token_ms": str(
                self.average_time_to_first_token_ms
            ),
            "average_throughput_tokens_per_second": str(
                self.average_throughput_tokens_per_second
            ),
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "success_rate": str(self.success_rate),
            "error_rate": str(self.error_rate),
        }


class PerformanceMonitor:
    """
    Stores performance profiles and exposes aggregate observations.

    Profiles can be queried globally or grouped by model/provider.
    """

    def __init__(
        self,
        *,
        max_profiles: Optional[int] = None,
    ) -> None:
        if max_profiles is not None and max_profiles <= 0:
            raise ValueError("max_profiles must be positive")

        self._profiles: list[PerformanceProfile] = []
        self._max_profiles = max_profiles

    @property
    def profile_count(self) -> int:
        return len(self._profiles)

    def record(
        self,
        profile: PerformanceProfile,
    ) -> PerformanceProfile:
        if not isinstance(profile, PerformanceProfile):
            raise TypeError(
                "profile must be a PerformanceProfile"
            )

        self._profiles.append(profile)

        if (
            self._max_profiles is not None
            and len(self._profiles) > self._max_profiles
        ):
            excess = len(self._profiles) - self._max_profiles
            del self._profiles[:excess]

        return profile

    def record_many(
        self,
        profiles: Iterable[PerformanceProfile],
    ) -> int:
        count = 0

        for profile in profiles:
            self.record(profile)
            count += 1

        return count

    def profiles(self) -> tuple[PerformanceProfile, ...]:
        return tuple(self._profiles)

    def snapshot(self) -> PerformanceSnapshot:
        return PerformanceSnapshot.from_profiles(
            self._profiles
        )

    def model_snapshot(
        self,
        model: str,
    ) -> PerformanceSnapshot:
        return PerformanceSnapshot.from_profiles(
            profile
            for profile in self._profiles
            if profile.model == model
        )

    def provider_snapshot(
        self,
        provider: str,
    ) -> PerformanceSnapshot:
        return PerformanceSnapshot.from_profiles(
            profile
            for profile in self._profiles
            if profile.provider == provider
        )

    def model_provider_snapshot(
        self,
        *,
        model: str,
        provider: str,
    ) -> PerformanceSnapshot:
        return PerformanceSnapshot.from_profiles(
            profile
            for profile in self._profiles
            if (
                profile.model == model
                and profile.provider == provider
            )
        )

    def recent(
        self,
        limit: int = 10,
    ) -> tuple[PerformanceProfile, ...]:
        if limit <= 0:
            return ()

        return tuple(self._profiles[-limit:])

    def clear(self) -> None:
        self._profiles.clear()

    def group_by_model(
        self,
    ) -> dict[str, PerformanceSnapshot]:
        grouped: dict[str, list[PerformanceProfile]] = (
            defaultdict(list)
        )

        for profile in self._profiles:
            grouped[profile.model].append(profile)

        return {
            model: PerformanceSnapshot.from_profiles(
                profiles
            )
            for model, profiles in grouped.items()
        }

    def group_by_provider(
        self,
    ) -> dict[str, PerformanceSnapshot]:
        grouped: dict[str, list[PerformanceProfile]] = (
            defaultdict(list)
        )

        for profile in self._profiles:
            grouped[profile.provider].append(profile)

        return {
            provider: PerformanceSnapshot.from_profiles(
                profiles
            )
            for provider, profiles in grouped.items()
        }


def create_monitor(
    *,
    max_profiles: Optional[int] = None,
) -> PerformanceMonitor:
    return PerformanceMonitor(
        max_profiles=max_profiles
    )


__all__ = [
    "PerformanceSnapshot",
    "PerformanceMonitor",
    "create_monitor",
]
