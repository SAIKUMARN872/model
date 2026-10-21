from dataclasses import dataclass

@dataclass(frozen=True)
class Quota:
    name: str
    limit: float
    used: float = 0.0

    @property
    def remaining(self) -> float:
        return max(0.0, self.limit - self.used)

    @property
    def exceeded(self) -> bool:
        return self.used > self.limit
