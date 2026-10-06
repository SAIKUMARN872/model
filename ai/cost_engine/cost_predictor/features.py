from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .models import CostPredictionRequest


@dataclass(frozen=True)
class CostFeatures:
    """Normalized features used for cost prediction."""

    input_tokens: int
    expected_output_tokens: int
    total_expected_tokens: int
    input_token_ratio: Decimal
    output_token_ratio: Decimal


def extract_features(
    request: CostPredictionRequest,
) -> CostFeatures:
    """Extract normalized prediction features from a request."""

    if request.input_tokens < 0:
        raise ValueError(
            "input_tokens cannot be negative"
        )

    if request.expected_output_tokens < 0:
        raise ValueError(
            "expected_output_tokens cannot be negative"
        )

    total = (
        request.input_tokens
        + request.expected_output_tokens
    )

    if total == 0:
        input_ratio = Decimal("0")
        output_ratio = Decimal("0")
    else:
        input_ratio = (
            Decimal(request.input_tokens)
            / Decimal(total)
        )
        output_ratio = (
            Decimal(request.expected_output_tokens)
            / Decimal(total)
        )

    return CostFeatures(
        input_tokens=request.input_tokens,
        expected_output_tokens=request.expected_output_tokens,
        total_expected_tokens=total,
        input_token_ratio=input_ratio,
        output_token_ratio=output_ratio,
    )


__all__ = [
    "CostFeatures",
    "extract_features",
]
