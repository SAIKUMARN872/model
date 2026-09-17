"""
Hallucination detection utilities.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Claim:
    """Represents an extracted factual claim."""

    text: str

    supported: bool = False

    evidence: list[str] = field(
        default_factory=list
    )

    confidence: float = 0.0


@dataclass
class HallucinationDetection:
    """Hallucination detection result."""

    hallucinated: bool

    claims: list[Claim]

    unsupported_claims: list[Claim]

    score: float

    explanation: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class HallucinationDetector:
    """
    Lightweight claim/evidence detector.

    This is intentionally deterministic. For production
    factual verification, it can later be connected to
    an external verifier or LLM judge.
    """

    def extract_claims(
        self,
        text: str,
    ) -> list[Claim]:

        text = str(
            text
        ).strip()

        if not text:
            return []

        sentences = re.split(
            r"(?<=[.!?])\s+",
            text,
        )

        return [
            Claim(
                text=sentence.strip()
            )
            for sentence in sentences
            if sentence.strip()
        ]

    def check(
        self,
        answer: str,
        evidence: list[str],
    ) -> HallucinationDetection:

        claims = self.extract_claims(
            answer
        )

        normalized_evidence = [
            self._normalize(item)
            for item in evidence
        ]

        unsupported = []

        for claim in claims:

            claim_normalized = self._normalize(
                claim.text
            )

            matches = [
                source
                for source in normalized_evidence
                if self._token_overlap(
                    claim_normalized,
                    source,
                ) >= 0.35
            ]

            if matches:

                claim.supported = True

                claim.confidence = min(
                    1.0,
                    max(
                        self._token_overlap(
                            claim_normalized,
                            source,
                        )
                        for source in matches
                    ),
                )

                claim.evidence = matches

            else:

                claim.supported = False

                claim.confidence = 0.0

                unsupported.append(
                    claim
                )

        total = len(
            claims
        )

        supported_count = (
            total
            - len(unsupported)
        )

        score = (
            supported_count / total
            if total
            else 1.0
        )

        hallucinated = bool(
            unsupported
        )

        explanation = (
            "All extracted claims have supporting evidence."
            if not hallucinated
            else
            f"{len(unsupported)} of "
            f"{total} claims lack sufficient evidence."
        )

        return HallucinationDetection(
            hallucinated=hallucinated,
            claims=claims,
            unsupported_claims=unsupported,
            score=score,
            explanation=explanation,
        )

    @staticmethod
    def _normalize(
        text: str,
    ) -> str:

        return re.sub(
            r"\s+",
            " ",
            text.lower(),
        ).strip()

    @staticmethod
    def _token_overlap(
        left: str,
        right: str,
    ) -> float:

        left_tokens = set(
            left.split()
        )

        right_tokens = set(
            right.split()
        )

        if not left_tokens:
            return 0.0

        return len(
            left_tokens
            & right_tokens
        ) / len(
            left_tokens
        )