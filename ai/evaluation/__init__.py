"""
ModelNow Evaluation Framework.
"""

from .constants import (
    DEFAULT_THRESHOLD,
    HIGHER_IS_BETTER,
    MAX_BATCH_SIZE,
    MAX_SCORE,
    MIN_SCORE,
    SUPPORTED_METRICS,
    EvaluationStatus,
    EvaluationType,
    MetricDirection,
)

from .exceptions import (
    EvaluationAlreadyExistsError,
    EvaluationAlreadyRunningError,
    EvaluationConfigurationError,
    EvaluationError,
    EvaluationExecutionError,
    EvaluationNotFoundError,
    EvaluationValidationError,
    MetricError,
    MetricNotFoundError,
    ResultStoreError,
    ScoringError,
)

from .models import (
    EvaluationMetric,
    EvaluationRequest,
    EvaluationResult,
)

from .interfaces import (
    EvaluationLogger,
    EvaluationPlugin,
    MetricEvaluator,
    ResultStore,
)

from .schemas import (
    EvaluationRequestSchema,
    EvaluationResultSchema,
)

from .engine import (
    EvaluationEngine,
    InMemoryResultStore,
    create_default_engine,
    generate_request,
)


__all__ = [
    # Constants
    "EvaluationStatus",
    "EvaluationType",
    "MetricDirection",
    "DEFAULT_THRESHOLD",
    "MIN_SCORE",
    "MAX_SCORE",
    "MAX_BATCH_SIZE",
    "SUPPORTED_METRICS",
    "HIGHER_IS_BETTER",

    # Exceptions
    "EvaluationError",
    "EvaluationValidationError",
    "EvaluationNotFoundError",
    "EvaluationAlreadyExistsError",
    "EvaluationAlreadyRunningError",
    "EvaluationExecutionError",
    "MetricError",
    "MetricNotFoundError",
    "ScoringError",
    "EvaluationConfigurationError",
    "ResultStoreError",

    # Models
    "EvaluationMetric",
    "EvaluationRequest",
    "EvaluationResult",

    # Interfaces
    "MetricEvaluator",
    "EvaluationPlugin",
    "ResultStore",
    "EvaluationLogger",

    # Schemas
    "EvaluationRequestSchema",
    "EvaluationResultSchema",

    # Engine
    "EvaluationEngine",
    "InMemoryResultStore",
    "create_default_engine",
    "generate_request",
]


__version__ = "1.0.0"