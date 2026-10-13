"""Variants used in ModelNow A/B experiments."""
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Variant:
    name: str
    observations: tuple[dict[str, Any], ...] = field(default_factory=tuple)

    def __post_init__(self):
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("variant name must be a non-empty string")
        if not isinstance(self.observations, (tuple, list)):
            raise ValueError("observations must be a tuple or list")
        normalized = []
        for index, observation in enumerate(self.observations):
            if not isinstance(observation, dict):
                raise ValueError(f"observation {index} must be a dictionary")
            normalized.append(dict(observation))
        object.__setattr__(self, "observations", tuple(normalized))
