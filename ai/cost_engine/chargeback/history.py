from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List

@dataclass
class ChargebackHistory:
    records: List[dict] = field(default_factory=list)

    def add(self, record: dict) -> None:
        item = dict(record)
        item.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        self.records.append(item)

    def all(self) -> list[dict]:
        return list(self.records)
