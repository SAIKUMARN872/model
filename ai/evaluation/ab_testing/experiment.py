"""
A/B testing experiment management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .variant import Variant


class ExperimentStatus(
    str,
    Enum,
):
    CREATED = "created"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass
class ABExperiment:
    """Represents an A/B testing experiment."""

    name: str

    variants: list[Variant] = field(
        default_factory=list
    )

    description: str = ""

    status: ExperimentStatus = (
        ExperimentStatus.CREATED
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = self.name.strip()

        if not self.name:
            raise ValueError(
                "Experiment name cannot be empty."
            )

    def add_variant(
        self,
        variant: Variant,
    ) -> None:

        if any(
            item.variant_id
            == variant.variant_id
            for item in self.variants
        ):
            raise ValueError(
                "Variant already exists."
            )

        self.variants.append(
            variant
        )

        self.validate_traffic()

    def remove_variant(
        self,
        variant_id: str,
    ) -> Variant | None:

        for index, variant in enumerate(
            self.variants
        ):

            if variant.variant_id == variant_id:

                return self.variants.pop(
                    index
                )

        return None

    def get_variant(
        self,
        variant_id: str,
    ) -> Variant | None:

        for variant in self.variants:

            if variant.variant_id == variant_id:
                return variant

        return None

    def validate_traffic(self) -> None:

        total = sum(
            variant.traffic_percentage
            for variant in self.variants
        )

        if self.variants and abs(
            total - 100.0
        ) > 0.001:

            raise ValueError(
                f"Variant traffic must equal 100%. "
                f"Current total: {total:.2f}%"
            )

    def start(self) -> None:

        if not self.variants:
            raise ValueError(
                "At least one variant is required."
            )

        self.validate_traffic()

        if self.status == ExperimentStatus.COMPLETED:
            raise ValueError(
                "Completed experiment cannot be started."
            )

        self.status = (
            ExperimentStatus.RUNNING
        )

    def pause(self) -> None:

        if self.status != ExperimentStatus.RUNNING:
            raise ValueError(
                "Only running experiments can be paused."
            )

        self.status = (
            ExperimentStatus.PAUSED
        )

    def complete(self) -> None:

        self.status = (
            ExperimentStatus.COMPLETED
        )

    def cancel(self) -> None:

        self.status = (
            ExperimentStatus.CANCELLED
        )

    def summary(self) -> dict[str, Any]:

        return {
            "name": self.name,
            "description": self.description,
            "status": self.status.value,
            "variants": [
                variant.summary()
                for variant in self.variants
            ],
        }