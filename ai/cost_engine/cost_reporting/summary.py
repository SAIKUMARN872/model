from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Iterable


@dataclass
class CostSummary:
    """Aggregated cost information."""

    total_cost: Decimal = Decimal("0")
    total_requests: int = 0
    total_tokens: int = 0

    input_tokens: int = 0
    output_tokens: int = 0

    input_cost: Decimal = Decimal("0")
    output_cost: Decimal = Decimal("0")

    currency: str = "USD"

    by_model: dict[str, Decimal] = field(default_factory=dict)
    by_provider: dict[str, Decimal] = field(default_factory=dict)
    by_tenant: dict[str, Decimal] = field(default_factory=dict)
    by_project: dict[str, Decimal] = field(default_factory=dict)
    by_user: dict[str, Decimal] = field(default_factory=dict)

    @property
    def average_cost_per_request(self) -> Decimal:
        if self.total_requests <= 0:
            return Decimal("0")

        return (
            self.total_cost
            / Decimal(self.total_requests)
        )

    @property
    def average_tokens_per_request(self) -> Decimal:
        if self.total_requests <= 0:
            return Decimal("0")

        return (
            Decimal(self.total_tokens)
            / Decimal(self.total_requests)
        )

    @property
    def cost_per_1k_tokens(self) -> Decimal:
        if self.total_tokens <= 0:
            return Decimal("0")

        return (
            self.total_cost
            / Decimal(self.total_tokens)
            * Decimal("1000")
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_cost": str(self.total_cost),
            "total_requests": self.total_requests,
            "total_tokens": self.total_tokens,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "input_cost": str(self.input_cost),
            "output_cost": str(self.output_cost),
            "average_cost_per_request": str(
                self.average_cost_per_request
            ),
            "average_tokens_per_request": str(
                self.average_tokens_per_request
            ),
            "cost_per_1k_tokens": str(
                self.cost_per_1k_tokens
            ),
            "currency": self.currency,
            "by_model": {
                key: str(value)
                for key, value in self.by_model.items()
            },
            "by_provider": {
                key: str(value)
                for key, value in self.by_provider.items()
            },
            "by_tenant": {
                key: str(value)
                for key, value in self.by_tenant.items()
            },
            "by_project": {
                key: str(value)
                for key, value in self.by_project.items()
            },
            "by_user": {
                key: str(value)
                for key, value in self.by_user.items()
            },
        }


class SummaryBuilder:
    """
    Builds CostSummary objects from usage records.

    Records can be dictionaries or objects exposing attributes.
    """

    def build(
        self,
        records: Iterable[Any],
        currency: str = "USD",
    ) -> CostSummary:

        summary = CostSummary(
            currency=currency
        )

        for record in records:
            self.add_record(
                summary,
                record,
            )

        return summary

    def add_record(
        self,
        summary: CostSummary,
        record: Any,
    ) -> None:

        cost = self._decimal(
            self._get(record, "cost", "total_cost", 0)
        )

        input_tokens = self._int(
            self._get(record, "input_tokens", 0)
        )

        output_tokens = self._int(
            self._get(record, "output_tokens", 0)
        )

        total_tokens = self._get(
            record,
            "total_tokens",
            None,
        )

        if total_tokens is None:
            total_tokens = (
                input_tokens + output_tokens
            )

        total_tokens = self._int(total_tokens)

        summary.total_cost += cost
        summary.total_requests += 1
        summary.total_tokens += total_tokens

        summary.input_tokens += input_tokens
        summary.output_tokens += output_tokens

        input_cost = self._decimal(
            self._get(record, "input_cost", 0)
        )

        output_cost = self._decimal(
            self._get(record, "output_cost", 0)
        )

        summary.input_cost += input_cost
        summary.output_cost += output_cost

        self._add_dimension(
            summary.by_model,
            self._get(record, "model"),
            cost,
        )

        self._add_dimension(
            summary.by_provider,
            self._get(record, "provider"),
            cost,
        )

        self._add_dimension(
            summary.by_tenant,
            self._get(record, "tenant_id"),
            cost,
        )

        self._add_dimension(
            summary.by_project,
            self._get(record, "project_id"),
            cost,
        )

        self._add_dimension(
            summary.by_user,
            self._get(record, "user_id"),
            cost,
        )

    @staticmethod
    def _get(
        record: Any,
        *names: str,
    ) -> Any:

        for name in names:
            if isinstance(record, dict):
                if name in record:
                    return record[name]
            else:
                if hasattr(record, name):
                    return getattr(record, name)

        return None

    @staticmethod
    def _decimal(value: Any) -> Decimal:
        return Decimal(str(value or 0))

    @staticmethod
    def _int(value: Any) -> int:
        return int(value or 0)

    @staticmethod
    def _add_dimension(
        target: dict[str, Decimal],
        key: Any,
        cost: Decimal,
    ) -> None:

        if key is None:
            return

        key = str(key)

        target[key] = (
            target.get(key, Decimal("0"))
            + cost
        )