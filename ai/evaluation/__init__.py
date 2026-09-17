"""
Evaluation constants.
"""

from enum import Enum


class EvaluationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class EvaluationType(str, Enum):
    GENERAL = "general"
    MODEL = "model"
    RAG = "rag"
    AGENT = "agent"
    RESPONSE = "response"
    BENCHMARK = "benchmark"
    REGRESSION = "regression"


class MetricDirection(str, Enum):
    MAXIMIZE = "maximize"
    MINIMIZE = "minimize"


DEFAULT_THRESHOLD = 0.70

MIN_SCORE = 0.0
MAX_SCORE = 1.0

DEFAULT_TIMEOUT_SECONDS = 60

MAX_BATCH_SIZE = 1000


SUPPORTED_METRICS = (
    "accuracy",
    "quality",
    "reliability",
    "latency",
    "cost",
    "relevance",
    "faithfulness",
    "groundedness",
)


HIGHER_IS_BETTER = {
    "accuracy": True,
    "quality": True,
    "reliability": True,
    "latency": False,
    "cost": False,
    "relevance": True,
    "faithfulness": True,
    "groundedness": True,
}