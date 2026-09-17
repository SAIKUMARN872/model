"""
Scoring weight configuration.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class MetricWeight:
    """Configuration for one metric."""

    name: str
    weight: float
    higher_is_better: bool = True

    def __post_init__(self) -> None:
        self.name = self.name.strip()

        if not self.name:
            raise ValueError("Metric name cannot be empty.")

        self.weight = float(self.weight)

        if self.weight < 0:
            raise ValueError("Weight cannot be negative.")


@dataclass
class WeightSet:
    """Collection of metric weights."""

    weights: dict[str, float] = field(
        default_factory=dict
    )

    directions: dict[str, bool] = field(
        default_factory=dict
    )

    normalize: bool = True

    def __post_init__(self) -> None:
        self._validate()

    def _validate(self) -> None:
        if not self.weights:
            raise ValueError(
                "At least one metric weight is required."
            )

        if any(
            float(value) < 0
            for value in self.weights.values()
        ):
            raise ValueError(
                "Weights cannot be negative."
            )

        if sum(
            float(value)
            for value in self.weights.values()
        ) <= 0:
            raise ValueError(
                "Total weight must be greater than zero."
            )

    def normalized(self) -> dict[str, float]:
        total = sum(
            float(value)
            for value in self.weights.values()
        )

        if not self.normalize:
            return {
                key: float(value)
                for key, value
                in self.weights.items()
            }

        return {
            key: float(value) / total
            for key, value
            in self.weights.items()
        }

    def get(self, metric: str) -> float:
        return float(
            self.weights.get(metric, 0.0)
        )

    def is_higher_better(
        self,
        metric: str,
    ) -> bool:
        return self.directions.get(
            metric,
            True,
        )

    def add(
        self,
        metric: str,
        weight: float,
        higher_is_better: bool = True,
    ) -> None:
        metric = metric.strip()

        if not metric:
            raise ValueError(
                "Metric name cannot be empty."
            )

        weight = float(weight)

        if weight < 0:
            raise ValueError(
                "Weight cannot be negative."
            )

        self.weights[metric] = weight
        self.directions[metric] = higher_is_better

        self._validate()

    def remove(self, metric: str) -> None:
        self.weights.pop(metric, None)
        self.directions.pop(metric, None)

        if self.weights:
            self._validate()

    def to_dict(self) -> dict:
        return {
            "weights": dict(self.weights),
            "normalized_weights":
                self.normalized(),
            "directions":
                dict(self.directions),
            "normalize":
                self.normalize,
        }


DEFAULT_WEIGHTS = WeightSet(
    weights={
        "accuracy": 0.30,
        "quality": 0.30,
        "reliability": 0.20,
        "latency": 0.10,
        "cost": 0.10,
    },
    directions={
        "accuracy": True,
        "quality": True,
        "reliability": True,
        "latency": False,
        "cost": False,
    },
)