from decimal import Decimal


# Engine version
OPTIMIZATION_ENGINE_VERSION = "1.0.0"


# Default optimization weights
DEFAULT_COST_WEIGHT = Decimal("0.33")
DEFAULT_LATENCY_WEIGHT = Decimal("0.33")
DEFAULT_QUALITY_WEIGHT = Decimal("0.34")


# Score boundaries
MIN_SCORE = Decimal("0")
MAX_SCORE = Decimal("1")


# Quality boundaries
MIN_QUALITY_SCORE = Decimal("0")
MAX_QUALITY_SCORE = Decimal("1")


# Latency boundaries
MIN_LATENCY_MS = Decimal("0")


# Cost boundaries
MIN_COST = Decimal("0")


# Numerical tolerance
SCORE_EPSILON = Decimal("0.00000001")


# Optimization thresholds
DEFAULT_IMPROVEMENT_THRESHOLD = Decimal("0.01")
DEFAULT_MIN_QUALITY_PRESERVATION = Decimal("0.95")
DEFAULT_MAX_COST_INCREASE = Decimal("0")
DEFAULT_MAX_LATENCY_INCREASE_MS = Decimal("0")


# Normalization defaults
DEFAULT_NORMALIZED_COST = Decimal("0")
DEFAULT_NORMALIZED_LATENCY = Decimal("0")
DEFAULT_NORMALIZED_QUALITY = Decimal("0")


# Supported optimization objectives
SUPPORTED_OBJECTIVES = (
    "cost",
    "latency",
    "quality",
    "balanced",
)


# Supported optimization actions
SUPPORTED_ACTIONS = (
    "keep",
    "switch_model",
    "switch_provider",
    "change_route",
    "reject",
)


# Optimization configuration
DEFAULT_OBJECTIVE = "balanced"
DEFAULT_CURRENCY = "USD"


__all__ = [
    "OPTIMIZATION_ENGINE_VERSION",
    "DEFAULT_COST_WEIGHT",
    "DEFAULT_LATENCY_WEIGHT",
    "DEFAULT_QUALITY_WEIGHT",
    "MIN_SCORE",
    "MAX_SCORE",
    "MIN_QUALITY_SCORE",
    "MAX_QUALITY_SCORE",
    "MIN_LATENCY_MS",
    "MIN_COST",
    "SCORE_EPSILON",
    "DEFAULT_IMPROVEMENT_THRESHOLD",
    "DEFAULT_MIN_QUALITY_PRESERVATION",
    "DEFAULT_MAX_COST_INCREASE",
    "DEFAULT_MAX_LATENCY_INCREASE_MS",
    "DEFAULT_NORMALIZED_COST",
    "DEFAULT_NORMALIZED_LATENCY",
    "DEFAULT_NORMALIZED_QUALITY",
    "SUPPORTED_OBJECTIVES",
    "SUPPORTED_ACTIONS",
    "DEFAULT_OBJECTIVE",
    "DEFAULT_CURRENCY",
]
