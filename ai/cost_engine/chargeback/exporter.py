from __future__ import annotations

import csv
import io
import json
from decimal import Decimal
from typing import Iterable

from .history import ChargebackEvent


class ChargebackExporter:
    """Exports chargeback records."""

    def to_dict(
        self,
        events: Iterable[ChargebackEvent],
    ) -> list[dict]:

        return [
            {
                "event_id": event.event_id,
                "chargeback_id": event.chargeback_id,
                "target_id": event.target_id,
                "amount": str(event.amount),
                "currency": event.currency,
                "event_type": event.event_type,
                "timestamp": event.timestamp.isoformat(),
                "metadata": event.metadata,
            }
            for event in events
        ]

    def to_json(
        self,
        events: Iterable[ChargebackEvent],
    ) -> str:

        return json.dumps(
            self.to_dict(events),
            indent=2,
            default=str,
        )

    def to_csv(
        self,
        events: Iterable[ChargebackEvent],
    ) -> str:

        events = list(events)

        output = io.StringIO()

        writer = csv.DictWriter(
            output,
            fieldnames=[
                "event_id",
                "chargeback_id",
                "target_id",
                "amount",
                "currency",
                "event_type",
                "timestamp",
            ],
        )

        writer.writeheader()

        for event in events:
            writer.writerow(
                {
                    "event_id": event.event_id,
                    "chargeback_id": event.chargeback_id,
                    "target_id": event.target_id,
                    "amount": str(event.amount),
                    "currency": event.currency,
                    "event_type": event.event_type,
                    "timestamp": event.timestamp.isoformat(),
                }
            )

        return output.getvalue()