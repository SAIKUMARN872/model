"""
Hallucination evaluation package.
"""

from .checker import (
    HallucinationCheckResult,
    HallucinationChecker,
)

from .detector import (
    Claim,
    HallucinationDetection,
    HallucinationDetector,
)

from .metrics import (
    HallucinationMetrics,
    calculate_evidence_coverage,
    calculate_hallucination_rate,
)


__all__ = [
    "Claim",
    "HallucinationDetection",
    "HallucinationDetector",
    "HallucinationChecker",
    "HallucinationCheckResult",
    "HallucinationMetrics",
    "calculate_evidence_coverage",
    "calculate_hallucination_rate",
]