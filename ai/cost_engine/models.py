from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class TokenUsage:
    input_tokens: int = 0
    output_tokens: int = 0

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


@dataclass(frozen=True)
class ModelPricing:
    model: str
    provider: str
    input_cost_per_1k_tokens: Decimal
    output_cost_per_1k_tokens: Decimal
    currency: str = "USD"
    pricing_version: str = "1.0"

    def calculate(self, usage: TokenUsage) -> Decimal:
        input_cost = (
            Decimal(usage.input_tokens)
            / Decimal(1000)
            * self.input_cost_per_1k_tokens
        )

        output_cost = (
            Decimal(usage.output_tokens)
            / Decimal(1000)
            * self.output_cost_per_1k_tokens
        )

        return input_cost + output_cost


@dataclass(frozen=True)
class CostRequest:
    model: str
    provider: str
    usage: TokenUsage
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class CostResult:
    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: Decimal
    output_cost: Decimal
    total_cost: Decimal
    currency: str
    request_id: Optional[str] = None
    calculated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Budget:
    budget_id: str
    limit: Decimal
    currency: str = "USD"
    spent: Decimal = Decimal("0")

    @property
    def remaining(self) -> Decimal:
        return max(self.limit - self.spent, Decimal("0"))

    @property
    def exceeded(self) -> bool:
        return self.spent > self.limit


@dataclass
class UsageRecord:
    request_id: str
    model: str
    provider: str
    usage: TokenUsage
    cost: Decimal
    currency: str = "USD"
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)
