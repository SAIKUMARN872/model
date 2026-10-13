"""Aggregate metrics for heuristic hallucination checks."""

from typing import Any


def calculate_hallucination_metrics(
    claims: list[dict[str, Any]],
) -> dict[str, float | int]:
    if not isinstance(claims, list):
        raise TypeError("claims must be a list")

    allowed_labels = {
        "supported_overlap",
        "unsupported_or_unclear",
        "possible_contradiction",
    }

    for index, claim in enumerate(claims):
        if not isinstance(claim, dict):
            raise TypeError(f"claims[{index}] must be a dictionary")
        label = claim.get("label")
        if label not in allowed_labels:
            raise ValueError(f"claims[{index}] has an invalid label: {label!r}")

    total = len(claims)
    supported = sum(c["label"] == "supported_overlap" for c in claims)
    unsupported = sum(c["label"] == "unsupported_or_unclear" for c in claims)
    contradictions = sum(c["label"] == "possible_contradiction" for c in claims)

    return {
        "claim_count": total,
        "supported_claim_count": supported,
        "unsupported_or_unclear_claim_count": unsupported,
        "possible_contradiction_count": contradictions,
        "support_rate": supported / total if total else 0.0,
        "unsupported_or_unclear_rate": unsupported / total if total else 0.0,
        "possible_contradiction_rate": contradictions / total if total else 0.0,
    }
