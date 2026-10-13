"""Quality evaluation for generated answers.

Scores are heuristic text-based indicators, not proof of factual correctness.
"""

from collections import Counter
import re
from typing import Any, Sequence


def _validate_text(value: str, name: str, *, optional: bool = False) -> str:
    if value is None and optional:
        return ""
    if not isinstance(value, str):
        raise TypeError(f"{name} must be a string")
    if not value.strip() and not optional:
        raise ValueError(f"{name} must not be empty")
    return value.strip()


def tokenize(text: str) -> list[str]:
    """Normalize text into case-insensitive word tokens."""
    text = _validate_text(text, "text", optional=True)
    return re.findall(r"\b[\w'-]+\b", text.casefold())


def token_precision_recall_f1(
    prediction: str,
    reference: str,
) -> dict[str, float]:
    """Calculate token-level precision, recall, and F1 using token counts."""
    prediction_tokens = tokenize(
        _validate_text(prediction, "prediction")
    )
    reference_tokens = tokenize(
        _validate_text(reference, "reference")
    )

    predicted = Counter(prediction_tokens)
    expected = Counter(reference_tokens)
    overlap = sum((predicted & expected).values())

    precision = overlap / len(prediction_tokens) if prediction_tokens else 0.0
    recall = overlap / len(reference_tokens) if reference_tokens else 0.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if precision + recall
        else 0.0
    )

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def evaluate_quality(
    answer: str,
    reference: str | None = None,
    context: str | None = None,
    required_points: Sequence[str] | None = None,
    question: str | None = None,
) -> dict[str, Any]:
    """Evaluate answer quality with explainable text-based metrics.

    Available dimensions:
    - relevance: token F1 against a reference, or question-token coverage.
    - completeness: reference-token recall, or required-point coverage.
    - context_alignment: fraction of answer tokens appearing in context.

    Only available dimensions contribute to the overall score. This is a
    heuristic score and does not establish factual correctness.
    """
    answer = _validate_text(answer, "answer")
    for name, value in (
        ("reference", reference),
        ("context", context),
        ("question", question),
    ):
        if value is not None:
            _validate_text(value, name)

    if required_points is not None:
        if isinstance(required_points, (str, bytes)):
            raise TypeError("required_points must be a sequence of strings")
        if not isinstance(required_points, (list, tuple)):
            raise TypeError("required_points must be a list or tuple")
        for point in required_points:
            _validate_text(point, "required point")

    answer_tokens = tokenize(answer)
    metrics: dict[str, float] = {}
    details: dict[str, Any] = {}

    if reference is not None:
        reference_scores = token_precision_recall_f1(answer, reference)
        metrics["relevance"] = reference_scores["f1"]
        metrics["completeness"] = reference_scores["recall"]
        details["reference_comparison"] = reference_scores
    elif question is not None:
        question_tokens = tokenize(question)
        unique_question_tokens = set(question_tokens)
        answer_token_set = set(answer_tokens)
        metrics["relevance"] = (
            len(unique_question_tokens & answer_token_set)
            / len(unique_question_tokens)
            if unique_question_tokens
            else 0.0
        )
        details["relevance_method"] = "question_token_coverage_heuristic"

    if required_points is not None:
        point_results = []
        answer_token_set = set(answer_tokens)

        for point in required_points:
            point_tokens = set(tokenize(point))
            coverage = (
                len(point_tokens & answer_token_set) / len(point_tokens)
                if point_tokens
                else 0.0
            )
            point_results.append({
                "point": point,
                "coverage": coverage,
                "covered": coverage >= 0.5,
            })

        if required_points:
            metrics["completeness"] = sum(
                item["coverage"] for item in point_results
            ) / len(point_results)
        else:
            metrics["completeness"] = 1.0

        details["required_points"] = point_results

    if context is not None:
        context_token_set = set(tokenize(context))
        metrics["context_alignment"] = (
            sum(1 for token in answer_tokens if token in context_token_set)
            / len(answer_tokens)
            if answer_tokens
            else 0.0
        )
        details["context_alignment_method"] = "answer_token_overlap"
        details["context_alignment_is_not_fact_verification"] = True

    weights = {
        "relevance": 0.5,
        "completeness": 0.3,
        "context_alignment": 0.2,
    }
    available_weight = sum(weights[name] for name in metrics)
    quality_score = (
        sum(value * weights[name] for name, value in metrics.items())
        / available_weight
        if available_weight
        else 0.0
    )

    return {
        "quality_score": round(quality_score, 4),
        "metrics": {key: round(value, 4) for key, value in metrics.items()},
        "metric_count": len(metrics),
        "details": details,
        "limitations": [
            "Text overlap does not prove factual correctness.",
            "Context alignment does not establish that claims are supported.",
            "Use a trusted reference, domain-specific checks, or a validated judge "
            "for stronger correctness evaluation.",
        ],
    }


def evaluate_quality_batch(
    answers: Sequence[str],
    references: Sequence[str] | None = None,
    *,
    contexts: Sequence[str | None] | None = None,
    required_points: Sequence[Sequence[str] | None] | None = None,
) -> dict[str, Any]:
    """Evaluate aligned batches of answers and optional references."""
    if isinstance(answers, (str, bytes)) or not isinstance(answers, (list, tuple)):
        raise TypeError("answers must be a list or tuple")
    if not answers:
        raise ValueError("answers must not be empty")

    for name, values in (
        ("references", references),
        ("contexts", contexts),
        ("required_points", required_points),
    ):
        if values is not None:
            if isinstance(values, (str, bytes)) or not isinstance(values, (list, tuple)):
                raise TypeError(f"{name} must be a list or tuple")
            if len(values) != len(answers):
                raise ValueError(f"{name} length must match answers length")

    results = []
    for index, answer in enumerate(answers):
        results.append(
            evaluate_quality(
                answer=answer,
                reference=references[index] if references is not None else None,
                context=contexts[index] if contexts is not None else None,
                required_points=(
                    required_points[index] if required_points is not None else None
                ),
            )
        )

    scores = [item["quality_score"] for item in results]
    return {
        "sample_count": len(results),
        "mean_quality_score": round(sum(scores) / len(scores), 4),
        "results": results,
    }
