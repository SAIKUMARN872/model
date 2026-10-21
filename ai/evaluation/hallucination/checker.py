"""Context-based hallucination checking."""

from typing import Any

from .detector import detect_claims


def check_hallucinations(answer: str, context: str) -> dict[str, Any]:
    """Check an answer for claims with weak or conflicting context support.

    This checker reports possible issues; it cannot establish factual truth.
    """
    claims = detect_claims(answer, context)
    total = len(claims)

    supported = sum(
        item["label"] == "supported_overlap" for item in claims
    )
    unsupported = sum(
        item["label"] == "unsupported_or_unclear" for item in claims
    )
    contradictions = sum(
        item["label"] == "possible_contradiction" for item in claims
    )

    return {
        "claim_count": total,
        "supported_claim_count": supported,
        "unsupported_or_unclear_claim_count": unsupported,
        "possible_contradiction_count": contradictions,
        "claims": claims,
        "metrics": {
            "support_rate": round(supported / total, 4) if total else 0.0,
            "unsupported_or_unclear_rate": (
                round(unsupported / total, 4) if total else 0.0
            ),
            "possible_contradiction_rate": (
                round(contradictions / total, 4) if total else 0.0
            ),
        },
        "limitations": [
            "Token overlap is not semantic entailment.",
            "A supported-overlap label does not prove a claim is true.",
            "A low-overlap claim may be valid but paraphrased.",
            "Negation detection can flag false positives and miss complex contradictions.",
        ],
    }


class HallucinationChecker:
    """Reusable wrapper for context-based claim checking."""

    def check(self, answer: str, context: str) -> dict[str, Any]:
        return check_hallucinations(answer, context)
