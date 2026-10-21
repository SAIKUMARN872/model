from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class CacheStrategy(str, Enum):
    """Supported latency cache strategies."""

    EXACT = "exact"
    TTL = "ttl"
    STALE_WHILE_REVALIDATE = "stale_while_revalidate"


@dataclass(frozen=True)
class CachePolicy:
    """Configuration controlling latency cache behavior."""

    enabled: bool = True
    ttl_seconds: float = 60.0
    strategy: CacheStrategy = CacheStrategy.TTL
    max_entries: int = 10_000
    cache_streaming: bool = False
    cache_failures: bool = False

    def __post_init__(self) -> None:
        if self.ttl_seconds <= 0.0:
            raise ValueError(
                "ttl_seconds must be greater than zero"
            )

        if self.max_entries <= 0:
            raise ValueError(
                "max_entries must be greater than zero"
            )

        if not isinstance(self.strategy, CacheStrategy):
            object.__setattr__(
                self,
                "strategy",
                CacheStrategy(self.strategy),
            )

    def allows(
        self,
        *,
        stream: bool = False,
        success: bool = True,
    ) -> bool:
        """Return whether a request/result may be cached."""

        if not self.enabled:
            return False

        if stream and not self.cache_streaming:
            return False

        if not success and not self.cache_failures:
            return False

        return True


DEFAULT_CACHE_POLICY = CachePolicy()


__all__ = [
    "CacheStrategy",
    "CachePolicy",
    "DEFAULT_CACHE_POLICY",
]
