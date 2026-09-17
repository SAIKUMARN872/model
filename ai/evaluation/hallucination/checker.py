"""
Hallucination checking orchestration.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .detector import (
    HallucinationDetection,
    HallucinationDetector,
)
from .metrics import (
    HallucinationMetrics,
    calculate_evidence_coverage,
    calculate_hallucination_rate,
)


@dataclass
class HallucinationCheckResult:
    """Complete hallucination check."""

    detection: HallucinationDetection

    metrics: HallucinationMetrics

    passed: bool

    threshold: float

    metadata: dict[str, Any]


class HallucinationChecker:
    """
    Checks whether generated responses are sufficiently
    grounded in supplied evidence.
    """

    def __init__(
        self,
        detector: HallucinationDetector | None = None,
        threshold: float = 0.8,
    ) -> None:

        if not 0 <= threshold <= 1:

            raise ValueError(
                "threshold must be between 0 and 1."
            )

        self.detector = (
            detector
            or HallucinationDetector()
        )

        self.threshold = threshold

    def check(
        self,
        answer: str,
        evidence: list[str],
    ) -> HallucinationCheckResult:

        detection = self.detector.check(
            answer,
            evidence,
        )

        total_claims = len(
            detection.claims
        )

        unsupported = len(
            detection.unsupported_claims
        )

        supported = (
            total_claims
            - unsupported
        )

        hallucination_rate = (
            calculate_hallucination_rate(
                supported,
                unsupported,
            )
        )

        evidence_coverage = (
            calculate_evidence_coverage(
                supported,
                total_claims,
            )
        )

        metrics = HallucinationMetrics(
            factuality=detection.score,
            groundedness=detection.score,
            unsupported_claim_rate=hallucination_rate,
            hallucination_rate=hallucination_rate,
            evidence_coverage=evidence_coverage,
        )

        passed = (
            metrics.overall_score
            >= self.threshold
        )

        return HallucinationCheckResult(
            detection=detection,
            metrics=metrics,
            passed=passed,
            threshold=self.threshold,
            metadata={
                "claim_count":
                    total_claims,
                "unsupported_claim_count":
                    unsupported,
            },
        )