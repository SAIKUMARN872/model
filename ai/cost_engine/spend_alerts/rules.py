from dataclasses import dataclass
from typing import Literal

Comparison = Literal["gt", "gte", "lt", "lte", "eq"]

@dataclass(frozen=True)
class SpendRule:
    threshold: float
    comparison: Comparison = "gte"

    def matches(self, value: float) -> bool:
        operations = {
            "gt": value > self.threshold,
            "gte": value >= self.threshold,
            "lt": value < self.threshold,
            "lte": value <= self.threshold,
            "eq": value == self.threshold,
        }
        return operations[self.comparison]
