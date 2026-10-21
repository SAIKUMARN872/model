from __future__ import annotations

from enum import StrEnum


class LoadBalancingStrategy(StrEnum):
    """Supported ModelNow load-balancing strategies."""

    ROUND_ROBIN = "round_robin"
    WEIGHTED = "weighted"
    LEAST_LOADED = "least_loaded"
    LATENCY_AWARE = "latency_aware"
    HEALTH_AWARE = "health_aware"


__all__ = ["LoadBalancingStrategy"]
