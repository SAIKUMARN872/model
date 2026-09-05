"""
Core data models for the ModelNow model pricing system.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


def _decimal(value: Decimal | int | float | str) -> Decimal:
    return Decimal(str(value))


@dataclass(frozen=True)
class TokenPricing:
    """
    Token-based pricing for a model.

    Prices are expressed per 1,000 tokens.
    """

    input_cost_per_1k: Decimal
    output_cost_per_1k: Decimal

    cached_input_cost_per_1k: Decimal = Decimal("0")
    reasoning_cost_per_1k: Decimal = Decimal("0")

    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.input_cost_per_1k < 0:
            raise ValueError(
                "input_cost_per_1k cannot be negative"
            )

        if self.output_cost_per_1k < 0:
            raise ValueError(
                "output_cost_per_1k cannot be negative"
            )

        if self.cached_input_cost_per_1k < 0:
            raise ValueError(
                "cached_input_cost_per_1k cannot be negative"
            )

        if self.reasoning_cost_per_1k < 0:
            raise ValueError(
                "reasoning_cost_per_1k cannot be negative"
            )

        if not self.currency:
            raise ValueError(
                "currency cannot be empty"
            )

    def cost(
        self,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cached_input_tokens: int = 0,
        reasoning_tokens: int = 0,
    ) -> Decimal:
        """
        Calculate total token cost.
        """

        for value in (
            input_tokens,
            output_tokens,
            cached_input_tokens,
            reasoning_tokens,
        ):
            if value < 0:
                raise ValueError(
                    "Token counts cannot be negative"
                )

        input_cost = (
            Decimal(input_tokens)
            / Decimal("1000")
            * self.input_cost_per_1k
        )

        output_cost = (
            Decimal(output_tokens)
            / Decimal("1000")
            * self.output_cost_per_1k
        )

        cached_cost = (
            Decimal(cached_input_tokens)
            / Decimal("1000")
            * self.cached_input_cost_per_1k
        )

        reasoning_cost = (
            Decimal(reasoning_tokens)
            / Decimal("1000")
            * self.reasoning_cost_per_1k
        )

        return (
            input_cost
            + output_cost
            + cached_cost
            + reasoning_cost
        )


@dataclass(frozen=True)
class ModelPricing:
    """
    Complete pricing definition for a model.
    """

    model: str
    provider: str
    token_pricing: TokenPricing

    version: str = "1.0.0"

    effective_from: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    effective_until: Optional[datetime] = None

    request_cost: Decimal = Decimal("0")

    currency: str = "USD"

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:
        if not self.model:
            raise ValueError(
                "model cannot be empty"
            )

        if not self.provider:
            raise ValueError(
                "provider cannot be empty"
            )

        if self.request_cost < 0:
            raise ValueError(
                "request_cost cannot be negative"
            )

        if not self.currency:
            raise ValueError(
                "currency cannot be empty"
            )

        if (
            self.effective_until is not None
            and self.effective_until
            <= self.effective_from
        ):
            raise ValueError(
                "effective_until must be after effective_from"
            )

    @property
    def input_cost_per_1k(self) -> Decimal:
        return self.token_pricing.input_cost_per_1k

    @property
    def output_cost_per_1k(self) -> Decimal:
        return self.token_pricing.output_cost_per_1k

    @property
    def cached_input_cost_per_1k(self) -> Decimal:
        return (
            self.token_pricing.cached_input_cost_per_1k
        )

    def is_active(
        self,
        at: datetime | None = None,
    ) -> bool:
        """
        Check whether this pricing definition is active.
        """

        at = at or datetime.now(timezone.utc)

        if at < self.effective_from:
            return False

        if (
            self.effective_until is not None
            and at >= self.effective_until
        ):
            return False

        return True

    def calculate_cost(
        self,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cached_input_tokens: int = 0,
        reasoning_tokens: int = 0,
    ) -> Decimal:
        """
        Calculate the cost for a request.
        """

        token_cost = self.token_pricing.cost(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_input_tokens=cached_input_tokens,
            reasoning_tokens=reasoning_tokens,
        )

        return token_cost + self.request_cost

    def to_dict(self) -> dict[str, Any]:
        return {
            "model": self.model,
            "provider": self.provider,
            "version": self.version,
            "currency": self.currency,
            "request_cost": str(self.request_cost),
            "effective_from": (
                self.effective_from.isoformat()
            ),
            "effective_until": (
                self.effective_until.isoformat()
                if self.effective_until
                else None
            ),
            "token_pricing": {
                "input_cost_per_1k": str(
                    self.token_pricing.input_cost_per_1k
                ),
                "output_cost_per_1k": str(
                    self.token_pricing.output_cost_per_1k
                ),
                "cached_input_cost_per_1k": str(
                    self.token_pricing.cached_input_cost_per_1k
                ),
                "reasoning_cost_per_1k": str(
                    self.token_pricing.reasoning_cost_per_1k
                ),
                "currency": self.token_pricing.currency,
            },
            "metadata": self.metadata,
        }