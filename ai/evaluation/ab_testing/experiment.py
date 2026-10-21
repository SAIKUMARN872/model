"""Configuration and validation for ModelNow A/B experiments."""
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Experiment:
    experiment_id: str
    control_name: str
    candidate_name: str
    primary_metric: str = "quality_score"
    minimum_samples: int = 30
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        for name in ("experiment_id", "control_name", "candidate_name", "primary_metric"):
            value = getattr(self, name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{name} must be a non-empty string")
        if self.control_name == self.candidate_name:
            raise ValueError("control_name and candidate_name must be different")
        if isinstance(self.minimum_samples, bool) or not isinstance(self.minimum_samples, int):
            raise ValueError("minimum_samples must be an integer")
        if self.minimum_samples < 2:
            raise ValueError("minimum_samples must be at least 2")
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary")
