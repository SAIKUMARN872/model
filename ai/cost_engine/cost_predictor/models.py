from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class CostPredictionRequest:
    """Input used to predict the cost of an AI request."""

    model: str
    provider: str
    input_tokens: int
    expected_output_tokens: int
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class CostPrediction:
    """Predicted cost for an AI request."""

    model: str
    provider: str
    input_tokens: int
    expected_output_tokens: int
    predicted_input_cost: Decimal
    predicted_output_cost: Decimal
    predicted_total_cost: Decimal
    currency: str = "USD"
    request_id: Optional[str] = None
    predicted_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class CostEstimate:
    """Estimated cost range for a request."""

    minimum_cost: Decimal
    expected_cost: Decimal
    maximum_cost: Decimal
    currency: str = "USD"
    confidence: Decimal = Decimal("0")
    metadata: Dict[str, Any] = field(default_factory=dict)


__all__ = [
    "CostPredictionRequest",
    "CostPrediction",
    "CostEstimate",
]
