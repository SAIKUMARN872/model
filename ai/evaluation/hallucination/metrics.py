"""
Hallucination evaluation metrics.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class HallucinationMetrics:
    """Hallucination evaluation metrics."""

    factuality: float

    groundedness: float

    unsupported_claim_rate: float

    hallucination_rate: float

    evidence_coverage: float

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def overall_score(self) -> float:

        return (
            self.factuality
            + self.groundedness
            + self.evidence_coverage
            + (
                1.0
                - self.hallucination_rate
            )
        ) / 4.0

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "factuality":
                self.factuality,
            "groundedness":
                self.groundedness,
            "unsupported_claim_rate":
                self.unsupported_claim_rate,
            "hallucination_rate":
                self.hallucination_rate,
            "evidence_coverage":
                self.evidence_coverage,
            "overall_score":
                self.overall_score,
            "metadata":
                self.metadata,
        }


def clamp(
    value: float,
) -> float:

    return max(
        0.0,
        min(
            float(value),
            1.0,
        ),
    )


def calculate_hallucination_rate(
    supported_claims: int,
    unsupported_claims: int,
) -> float:

    total = (
        supported_claims
        + unsupported_claims
    )

    if total == 0:
        return 0.0

    return unsupported_claims / total


def calculate_evidence_coverage(
    supported_claims: int,
    total_claims: int,
) -> float:

    if total_claims <= 0:
        return 1.0

    return clamp(
        supported_claims
        / total_claims
    )