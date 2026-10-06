from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class PolicyAction(StrEnum):
    ALLOW = "allow"
    PREFER = "prefer"
    REQUIRE = "require"
    DENY = "deny"


@dataclass(frozen=True)
class RoutingPolicy:
    name: str
    action: PolicyAction
    priority: int = 100
    enabled: bool = True
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool = True
    preferred_tier: str | None = None
    required_capabilities: tuple[str, ...] = ()
    min_quality: float | None = None
    max_cost: float | None = None
    max_latency_ms: float | None = None
    streaming_required: bool = False

    policies_applied: tuple[str, ...] = ()
    reasons: tuple[str, ...] = ()

    metadata: dict[str, object] = field(default_factory=dict)


__all__ = [
    "PolicyAction",
    "RoutingPolicy",
    "PolicyDecision",
]
