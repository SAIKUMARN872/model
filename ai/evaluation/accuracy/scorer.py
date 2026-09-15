"""
General scoring utilities.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ScoreType(
    str,
    Enum,
):
    EXACT_MATCH = "exact_match"
    CONTAINS = "contains"
    FUZZY = "fuzzy"
    NUMERIC = "numeric"
    MANUAL = "manual"


@dataclass
class Score:
    """Individual evaluation score."""

    value: float

    score_type: ScoreType

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.value = float(
            self.value
        )

        if not 0 <= self.value <= 1:

            raise ValueError(
                "Score must be between 0 and 1."
            )


class Scorer:
    """Collection of deterministic scoring functions."""

    @staticmethod
    def exact_match(
        prediction: Any,
        expected: Any,
    ) -> Score:

        value = (
            1.0
            if prediction == expected
            else 0.0
        )

        return Score(
            value=value,
            score_type=ScoreType.EXACT_MATCH,
        )

    @staticmethod
    def contains(
        prediction: str,
        expected: str,
    ) -> Score:

        prediction = str(
            prediction
        ).lower()

        expected = str(
            expected
        ).lower()

        value = (
            1.0
            if expected in prediction
            else 0.0
        )

        return Score(
            value=value,
            score_type=ScoreType.CONTAINS,
        )

    @staticmethod
    def token_overlap(
        prediction: str,
        expected: str,
    ) -> Score:

        prediction_tokens = set(
            str(prediction).lower().split()
        )

        expected_tokens = set(
            str(expected).lower().split()
        )

        if not expected_tokens:

            value = (
                1.0
                if not prediction_tokens
                else 0.0
            )

        else:

            value = (
                len(
                    prediction_tokens
                    & expected_tokens
                )
                / len(expected_tokens)
            )

        return Score(
            value=min(
                value,
                1.0,
            ),
            score_type=ScoreType.FUZZY,
        )

    @staticmethod
    def numeric(
        prediction: float,
        expected: float,
        tolerance: float = 0.0,
    ) -> Score:

        if tolerance < 0:
            raise ValueError(
                "tolerance cannot be negative."
            )

        prediction = float(
            prediction
        )

        expected = float(
            expected
        )

        difference = abs(
            prediction - expected
        )

        if difference <= tolerance:

            value = 1.0

        elif expected == 0:

            value = 0.0

        else:

            value = max(
                0.0,
                1.0
                - (
                    difference
                    / abs(expected)
                ),
            )

        return Score(
            value=value,
            score_type=ScoreType.NUMERIC,
        )