"""
Evaluation interfaces.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from .models import (
    EvaluationMetric,
    EvaluationRequest,
    EvaluationResult,
)


class MetricEvaluator(ABC):
    """Interface for metric implementations."""

    @property
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def evaluate(
        self,
        request: EvaluationRequest,
    ) -> EvaluationMetric:
        raise NotImplementedError


class EvaluationPlugin(ABC):
    """Interface for custom evaluation plugins."""

    @property
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def run(
        self,
        request: EvaluationRequest,
    ) -> EvaluationMetric:
        raise NotImplementedError


class ResultStore(ABC):
    """Storage interface for evaluation results."""

    @abstractmethod
    def save(
        self,
        result: EvaluationResult,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    def get(
        self,
        evaluation_id: str,
    ) -> EvaluationResult | None:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        evaluation_id: str,
    ) -> bool:
        raise NotImplementedError

    @abstractmethod
    def list(
        self,
    ) -> list[EvaluationResult]:
        raise NotImplementedError


class EvaluationLogger(ABC):
    """Logging abstraction."""

    @abstractmethod
    def info(
        self,
        message: str,
        **kwargs: Any,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    def warning(
        self,
        message: str,
        **kwargs: Any,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    def error(
        self,
        message: str,
        **kwargs: Any,
    ) -> None:
        raise NotImplementedError