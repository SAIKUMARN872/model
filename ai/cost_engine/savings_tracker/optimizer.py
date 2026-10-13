from dataclasses import dataclass

@dataclass(frozen=True)
class SavingsOptimization:
    baseline_cost: float
    optimized_cost: float

    @property
    def savings(self) -> float:
        return max(0.0, self.baseline_cost - self.optimized_cost)

    @property
    def savings_percent(self) -> float:
        if self.baseline_cost <= 0:
            return 0.0
        return (self.savings / self.baseline_cost) * 100
