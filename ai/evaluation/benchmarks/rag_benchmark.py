"""
RAG evaluation benchmark.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .utils import average


@dataclass
class RAGCase:
    """Single RAG benchmark case."""

    case_id: str

    question: str

    expected_answer: str

    relevant_documents: list[str] = field(
        default_factory=list
    )


@dataclass
class RAGResult:
    """RAG benchmark metrics."""

    total_cases: int

    answer_accuracy: float

    retrieval_precision: float

    retrieval_recall: float

    groundedness: float

    details: list[dict[str, Any]] = field(
        default_factory=list
    )


class RAGBenchmark:
    """
    Evaluates retrieval and generation quality.

    Predictor may return:

        {
            "answer": "...",
            "documents": [...]
        }
    """

    def __init__(
        self,
        name: str = "rag_benchmark",
    ) -> None:

        self.name = name

    async def run(
        self,
        cases: list[RAGCase],
        predictor: Callable[
            [str],
            Any,
        ],
    ) -> RAGResult:

        import inspect

        accuracies: list[float] = []

        precisions: list[float] = []

        recalls: list[float] = []

        groundedness: list[float] = []

        details: list[
            dict[str, Any]
        ] = []

        for case in cases:

            result = predictor(
                case.question
            )

            if inspect.isawaitable(
                result
            ):

                result = await result

            if not isinstance(
                result,
                dict,
            ):

                result = {
                    "answer": str(result),
                    "documents": [],
                }

            answer = str(
                result.get(
                    "answer",
                    "",
                )
            )

            retrieved = set(
                result.get(
                    "documents",
                    [],
                )
            )

            relevant = set(
                case.relevant_documents
            )

            answer_score = self._answer_score(
                answer,
                case.expected_answer,
            )

            true_positive = len(
                retrieved & relevant
            )

            precision = (
                true_positive
                / len(retrieved)
                if retrieved
                else 0.0
            )

            recall = (
                true_positive
                / len(relevant)
                if relevant
                else 1.0
            )

            grounded = (
                1.0
                if relevant
                and retrieved & relevant
                and answer
                else 0.0
            )

            accuracies.append(
                answer_score
            )

            precisions.append(
                precision
            )

            recalls.append(
                recall
            )

            groundedness.append(
                grounded
            )

            details.append(
                {
                    "case_id": case.case_id,
                    "answer_score":
                        answer_score,
                    "retrieval_precision":
                        precision,
                    "retrieval_recall":
                        recall,
                    "groundedness":
                        grounded,
                }
            )

        return RAGResult(
            total_cases=len(cases),
            answer_accuracy=average(
                accuracies
            ),
            retrieval_precision=average(
                precisions
            ),
            retrieval_recall=average(
                recalls
            ),
            groundedness=average(
                groundedness
            ),
            details=details,
        )

    @staticmethod
    def _answer_score(
        answer: str,
        expected: str,
    ) -> float:

        answer_tokens = set(
            answer.lower().split()
        )

        expected_tokens = set(
            expected.lower().split()
        )

        if not expected_tokens:
            return 1.0 if not answer_tokens else 0.0

        return (
            len(
                answer_tokens
                & expected_tokens
            )
            / len(expected_tokens)
        )