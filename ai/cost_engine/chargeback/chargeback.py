from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Dict, Iterable, List
from uuid import uuid4

from .allocation import (
    AllocationResult,
    AllocationRule,
    CostAllocator,
)
from .history import (
    ChargebackEvent,
    ChargebackHistory,
)
from .invoice import Invoice


@dataclass
class ChargebackRecord:
    chargeback_id: str
    source_id: str
    source_type: str

    total_cost: Decimal
    currency: str

    allocations: List[AllocationResult]

    tenant_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None
    department_id: str | None = None

    model: str | None = None
    provider: str | None = None

    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    metadata: Dict[str, Any] = field(default_factory=dict)


class ChargebackEngine:
    """
    Main AI cost chargeback engine.

    Responsibilities:

    1. Accept actual usage costs.
    2. Allocate costs to internal targets.
    3. Store chargeback history.
    4. Generate invoices.
    5. Provide cost summaries.
    """

    def __init__(
        self,
        allocator: CostAllocator | None = None,
        history: ChargebackHistory | None = None,
    ) -> None:

        self.allocator = allocator or CostAllocator()
        self.history = history or ChargebackHistory()

        self._records: Dict[str, ChargebackRecord] = {}
        self._lock = RLock()

    def create_chargeback(
        self,
        source_id: str,
        source_type: str,
        total_cost: Decimal,
        allocation_rules: Iterable[AllocationRule],
        currency: str = "USD",
        tenant_id: str | None = None,
        project_id: str | None = None,
        user_id: str | None = None,
        department_id: str | None = None,
        model: str | None = None,
        provider: str | None = None,
        metadata: Dict[str, Any] | None = None,
    ) -> ChargebackRecord:

        total_cost = Decimal(str(total_cost))

        if total_cost < 0:
            raise ValueError("total_cost cannot be negative")

        if not source_id:
            raise ValueError("source_id cannot be empty")

        if not source_type:
            raise ValueError("source_type cannot be empty")

        allocations = self.allocator.allocate(
            total_cost,
            allocation_rules,
        )

        chargeback_id = str(uuid4())

        record = ChargebackRecord(
            chargeback_id=chargeback_id,
            source_id=source_id,
            source_type=source_type,
            total_cost=total_cost,
            currency=currency,
            allocations=allocations,
            tenant_id=tenant_id,
            project_id=project_id,
            user_id=user_id,
            department_id=department_id,
            model=model,
            provider=provider,
            metadata=metadata or {},
        )

        with self._lock:
            self._records[chargeback_id] = record

        self._record_events(record)

        return record

    def _record_events(
        self,
        record: ChargebackRecord,
    ) -> None:

        for allocation in record.allocations:

            event = ChargebackEvent(
                event_id=str(uuid4()),
                chargeback_id=record.chargeback_id,
                target_id=allocation.target_id,
                amount=allocation.amount,
                currency=record.currency,
                event_type="CHARGEBACK_CREATED",
                metadata={
                    "source_id": record.source_id,
                    "source_type": record.source_type,
                    "model": record.model,
                    "provider": record.provider,
                    "percentage": str(
                        allocation.percentage
                    ),
                },
            )

            self.history.record(event)

    def get(
        self,
        chargeback_id: str,
    ) -> ChargebackRecord | None:

        with self._lock:
            return self._records.get(chargeback_id)

    def all_records(self) -> List[ChargebackRecord]:

        with self._lock:
            return list(self._records.values())

    def get_target_cost(
        self,
        target_id: str,
    ) -> Decimal:

        records = self.all_records()

        total = Decimal("0")

        for record in records:
            for allocation in record.allocations:
                if allocation.target_id == target_id:
                    total += allocation.amount

        return total

    def get_summary(
        self,
        target_id: str | None = None,
    ) -> Dict[str, Decimal]:

        records = self.all_records()

        summary: Dict[str, Decimal] = {}

        for record in records:
            for allocation in record.allocations:

                if (
                    target_id is not None
                    and allocation.target_id != target_id
                ):
                    continue

                current = summary.get(
                    allocation.target_id,
                    Decimal("0"),
                )

                summary[allocation.target_id] = (
                    current + allocation.amount
                )

        return summary

    def generate_invoice(
        self,
        customer_id: str,
        period_start: datetime,
        period_end: datetime,
        currency: str = "USD",
        tax_rate: Decimal = Decimal("0"),
    ) -> Invoice:

        invoice = Invoice(
            invoice_id=str(uuid4()),
            customer_id=customer_id,
            currency=currency,
            period_start=period_start,
            period_end=period_end,
        )

        records = self.all_records()

        for record in records:

            if record.currency != currency:
                continue

            if not (
                period_start
                <= record.timestamp
                <= period_end
            ):
                continue

            for allocation in record.allocations:

                if allocation.target_id != customer_id:
                    continue

                description = (
                    f"AI usage - "
                    f"{record.model or 'unknown model'}"
                )

                invoice.add_line(
                    description=description,
                    quantity=Decimal("1"),
                    unit_price=allocation.amount,
                    metadata={
                        "chargeback_id": record.chargeback_id,
                        "source_id": record.source_id,
                        "provider": record.provider,
                    },
                )

        invoice.recalculate(tax_rate)

        return invoice

    def reverse_chargeback(
        self,
        chargeback_id: str,
        reason: str,
    ) -> ChargebackRecord:

        record = self.get(chargeback_id)

        if record is None:
            raise KeyError(
                f"Chargeback not found: {chargeback_id}"
            )

        for allocation in record.allocations:

            event = ChargebackEvent(
                event_id=str(uuid4()),
                chargeback_id=chargeback_id,
                target_id=allocation.target_id,
                amount=-allocation.amount,
                currency=record.currency,
                event_type="CHARGEBACK_REVERSED",
                metadata={
                    "reason": reason,
                },
            )

            self.history.record(event)

        return record