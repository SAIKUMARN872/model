"""
Preprocessing pipeline for embedding inputs.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .normalizer import (
    TextNormalizer,
)
from .utils import validate_text


@dataclass
class PreprocessingResult:
    """Result of preprocessing."""

    original: str

    processed: str

    changed: bool

    steps: list[str]


class EmbeddingPreprocessor:
    """
    Runs normalization and custom preprocessing steps.
    """

    def __init__(
        self,
        normalizer: TextNormalizer | None = None,
        steps: list[
            Callable[[str], str]
        ] | None = None,
    ) -> None:

        self.normalizer = (
            normalizer
            or TextNormalizer()
        )

        self.steps = steps or []

    def add_step(
        self,
        step: Callable[[str], str],
    ) -> None:

        if not callable(step):

            raise TypeError(
                "Preprocessing step must be callable"
            )

        self.steps.append(
            step
        )

    def process(
        self,
        text: str,
    ) -> PreprocessingResult:

        original = validate_text(
            text
        )

        processed = self.normalizer.normalize(
            original
        )

        executed_steps = [
            "normalization"
        ]

        for step in self.steps:

            processed = step(
                processed
            )

            if not isinstance(
                processed,
                str,
            ):

                raise TypeError(
                    "Preprocessing steps must "
                    "return strings"
                )

            processed = processed.strip()

            if not processed:

                raise ValueError(
                    "Preprocessing produced empty text"
                )

            executed_steps.append(
                getattr(
                    step,
                    "__name__",
                    "custom_step",
                )
            )

        return PreprocessingResult(
            original=original,
            processed=processed,
            changed=(
                original != processed
            ),
            steps=executed_steps,
        )

    def process_many(
        self,
        texts: list[str],
    ) -> list[PreprocessingResult]:

        return [
            self.process(text)
            for text in texts
        ]

    def process_query(
        self,
        query: str,
    ) -> PreprocessingResult:

        original = validate_text(
            query
        )

        processed = (
            self.normalizer.normalize_query(
                original
            )
        )

        for step in self.steps:

            processed = step(
                processed
            )

        return PreprocessingResult(
            original=original,
            processed=processed,
            changed=(
                original != processed
            ),
            steps=[
                "query_normalization",
                *[
                    getattr(
                        step,
                        "__name__",
                        "custom_step",
                    )
                    for step in self.steps
                ],
            ],
        )

    def process_document(
        self,
        document: str,
    ) -> PreprocessingResult:

        original = validate_text(
            document
        )

        processed = (
            self.normalizer.normalize_document(
                original
            )
        )

        for step in self.steps:

            processed = step(
                processed
            )

        return PreprocessingResult(
            original=original,
            processed=processed,
            changed=(
                original != processed
            ),
            steps=[
                "document_normalization",
                *[
                    getattr(
                        step,
                        "__name__",
                        "custom_step",
                    )
                    for step in self.steps
                ],
            ],
        )