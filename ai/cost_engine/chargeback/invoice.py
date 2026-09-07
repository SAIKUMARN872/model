from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import List


@dataclass
class InvoiceLine:
    description: str
    quantity: Decimal
    unit_price: Decimal
    amount: Decimal
    metadata: dict = field(default_factory=dict)


@dataclass
class Invoice:
    invoice_id: str
    customer_id: str
    currency: str
    period_start: datetime
    period_end: datetime
    lines: List[InvoiceLine] = field(default_factory=list)
    subtotal: Decimal = Decimal("0")
    tax: Decimal = Decimal("0")
    total: Decimal = Decimal("0")
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def add_line(
        self,
        description: str,
        quantity: Decimal,
        unit_price: Decimal,
        metadata: dict | None = None,
    ) -> InvoiceLine:

        quantity = Decimal(str(quantity))
        unit_price = Decimal(str(unit_price))

        amount = (
            quantity * unit_price
        ).quantize(Decimal("0.0001"))

        line = InvoiceLine(
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            amount=amount,
            metadata=metadata or {},
        )

        self.lines.append(line)

        self.recalculate()

        return line

    def recalculate(
        self,
        tax_rate: Decimal = Decimal("0"),
    ) -> None:

        self.subtotal = sum(
            (line.amount for line in self.lines),
            Decimal("0"),
        )

        self.tax = (
            self.subtotal * Decimal(str(tax_rate))
        ).quantize(Decimal("0.0001"))

        self.total = self.subtotal + self.tax

    def to_dict(self) -> dict:
        return {
            "invoice_id": self.invoice_id,
            "customer_id": self.customer_id,
            "currency": self.currency,
            "period_start": self.period_start.isoformat(),
            "period_end": self.period_end.isoformat(),
            "subtotal": str(self.subtotal),
            "tax": str(self.tax),
            "total": str(self.total),
            "created_at": self.created_at.isoformat(),
            "lines": [
                {
                    "description": line.description,
                    "quantity": str(line.quantity),
                    "unit_price": str(line.unit_price),
                    "amount": str(line.amount),
                    "metadata": line.metadata,
                }
                for line in self.lines
            ],
        }