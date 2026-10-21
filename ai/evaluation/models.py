"""Evaluation data models."""
from dataclasses import dataclass, field
from typing import Any

@dataclass(frozen=True)
class EvaluationCase:
    case_id: str
    model_name: str
    answer: str
    reference_answer: str | None = None
    context: str | None = None
    latency_ms: float | None = None
    cost_usd: float | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True)
class EvaluationResult:
    case_id: str
    model_name: str
    metrics: dict[str, float | int | bool | None]
    quality_score: float | None
    metadata: dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True)
class ModelEvaluationSummary:
    model_name: str
    case_count: int
    mean_quality_score: float | None
    mean_latency_ms: float | None
    total_cost_usd: float
    total_input_tokens: int
    total_output_tokens: int
