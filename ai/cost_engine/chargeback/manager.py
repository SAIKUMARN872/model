from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional

from .allocator import ChargebackAllocator
from .exceptions import (
    ChargebackNotFoundError,
    InvalidChargebackError,
)
from .models import (
    ChargebackAllocation,
    ChargebackEntry,
    ChargebackSummary,
)
from .utils import (
    validate_amount,
    validate_entity,
)


class ChargebackManager:
    """Manages chargeback entries, allocations, and summaries."""

    def __init__(
        self,
        allocator: ChargebackAllocator | None = None,
    ) -> None:
        self.allocator = allocator or ChargebackAllocator()
        self._entries: dict[str, ChargebackEntry] = {}

    def record(
        self,
        entry: ChargebackEntry,
    ) -> ChargebackEntry:
        """Record a chargeback entry."""

        if not entry.chargeback_id.strip():
            raise InvalidChargebackError(
                "chargeback_id cannot be empty"
            )

        validate_amount(entry.amount)

        entity_type, entity_id = validate_entity(
            entry.entity_type,
            entry.entity_id,
        )

        normalized_entry = ChargebackEntry(
            chargeback_id=entry.chargeback_id,
            amount=entry.amount,
            currency=entry.currency.upper(),
            entity_type=entity_type,
            entity_id=entity_id,
            request_id=entry.request_id,
            model=entry.model,
            provider=entry.provider,
            timestamp=entry.timestamp,
            metadata=entry.metadata,
        )

        self._entries[
            normalized_entry.chargeback_id
        ] = normalized_entry

        return normalized_entry

    def create(
        self,
        chargeback_id: str,
        amount: Decimal,
        entity_type: str,
        entity_id: str,
        currency: str = "USD",
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> ChargebackEntry:
        """Create and record a chargeback entry."""

        entry = ChargebackEntry(
            chargeback_id=chargeback_id,
            amount=validate_amount(amount),
            currency=currency.upper(),
            entity_type=entity_type,
            entity_id=entity_id,
            request_id=request_id,
            model=model,
            provider=provider,
        )

        return self.record(entry)

    def get(
        self,
        chargeback_id: str,
    ) -> ChargebackEntry | None:
        """Get a chargeback entry."""

        return self._entries.get(chargeback_id)

    def require(
        self,
        chargeback_id: str,
    ) -> ChargebackEntry:
        """Get a chargeback entry or raise an error."""

        entry = self.get(chargeback_id)

        if entry is None:
            raise ChargebackNotFoundError(
                f"Chargeback not found: {chargeback_id}"
            )

        return entry

    def allocate(
        self,
        total_amount: Decimal,
        allocations: Iterable[
            tuple[str, str, Decimal]
        ],
    ) -> list[ChargebackAllocation]:
        """Allocate a cost across entities."""

        return self.allocator.allocate(
            total_amount=total_amount,
            allocations=allocations,
        )

    def allocate_equal(
        self,
        total_amount: Decimal,
        entities: Iterable[tuple[str, str]],
    ) -> list[ChargebackAllocation]:
        """Allocate a cost equally across entities."""

        return self.allocator.allocate_equal(
            total_amount=total_amount,
            entities=entities,
        )

    def list_entries(self) -> list[ChargebackEntry]:
        """Return all chargeback entries."""

        return list(self._entries.values())

    def total_cost(
        self,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        currency: str = "USD",
    ) -> Decimal:
        """Calculate total chargeback cost for an entity."""

        total = Decimal("0")
        normalized_type = (
            entity_type.strip().lower()
            if entity_type
            else None
        )

        for entry in self._entries.values():
            if entry.currency.upper() != currency.upper():
                continue

            if (
                normalized_type is not None
                and entry.entity_type != normalized_type
            ):
                continue

            if (
                entity_id is not None
                and entry.entity_id != entity_id
            ):
                continue

            total += entry.amount

        return total

    def summarize(
        self,
        entity_type: str,
        entity_id: str,
        currency: str = "USD",
    ) -> ChargebackSummary:
        """Create a cost summary for an entity."""

        normalized_type, normalized_id = validate_entity(
            entity_type,
            entity_id,
        )

        entries = [
            entry
            for entry in self._entries.values()
            if entry.entity_type == normalized_type
            and entry.entity_id == normalized_id
            and entry.currency.upper() == currency.upper()
        ]

        return ChargebackSummary(
            entity_type=normalized_type,
            entity_id=normalized_id,
            total_cost=sum(
                (entry.amount for entry in entries),
                Decimal("0"),
            ),
            currency=currency.upper(),
            entry_count=len(entries),
        )

    def count(self) -> int:
        """Return the number of chargeback entries."""

        return len(self._entries)


__all__ = [
    "ChargebackManager",
]
