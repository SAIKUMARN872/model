from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, Optional

from .constants import DEFAULT_CURRENCY
from .models import CostRequest, CostResult, TokenUsage


@dataclass(frozen=True)
class CostRequestSchema:
    model: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_model(self) -> CostRequest:
        return CostRequest(
            model=self.model,
            provider=self.provider,
            usage=TokenUsage(
                input_tokens=self.input_tokens,
                output_tokens=self.output_tokens,
            ),
            request_id=self.request_id,
            metadata=self.metadata,
        )


@dataclass(frozen=True)
class CostResultSchema:
    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: Decimal
    output_cost: Decimal
    total_cost: Decimal
    currency: str = DEFAULT_CURRENCY
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_model(cls, result: CostResult) -> "CostResultSchema":
        return cls(
            model=result.model,
            provider=result.provider,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            total_tokens=result.total_tokens,
            input_cost=result.input_cost,
            output_cost=result.output_cost,
            total_cost=result.total_cost,
            currency=result.currency,
            request_id=result.request_id,
            metadata=result.metadata,
        )


@dataclass(frozen=True)
class BudgetStatusSchema:
    budget_id: str
    limit: Decimal
    spent: Decimal
    remaining: Decimal
    exceeded: bool
    currency: str = DEFAULT_CURRENCY


@dataclass(frozen=True)
class CostSummarySchema:
    total_requests: int
    total_tokens: int
    total_cost: Decimal
    currency: str = DEFAULT_CURRENCY
