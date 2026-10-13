"""Evaluation interfaces."""
from typing import Protocol, Sequence
from .models import EvaluationCase, EvaluationResult

class Evaluator(Protocol):
    def evaluate(self, case: EvaluationCase) -> EvaluationResult:
        ...

class BatchEvaluator(Protocol):
    def evaluate_batch(self, cases: Sequence[EvaluationCase]) -> list[EvaluationResult]:
        ...
