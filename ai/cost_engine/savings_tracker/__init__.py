"""
Savings Tracker package for the ModelNow Cost Engine.

Provides:

- Savings event tracking
- Savings analysis
- Cost optimization recommendations
- Savings reports
"""

from .tracker import (
    SavingsEvent,
    SavingsTracker,
    SavingsTrackingError,
)

from .analyzer import (
    SavingsAnalysis,
    SavingsAnalyzer,
)

from .optimizer import (
    ModelOption,
    OptimizationCandidate,
    SavingsOptimizer,
)

from .reports import (
    SavingsReport,
    SavingsReportGenerator,
)


__all__ = [
    # Tracker
    "SavingsEvent",
    "SavingsTracker",
    "SavingsTrackingError",

    # Analyzer
    "SavingsAnalysis",
    "SavingsAnalyzer",

    # Optimizer
    "ModelOption",
    "OptimizationCandidate",
    "SavingsOptimizer",

    # Reports
    "SavingsReport",
    "SavingsReportGenerator",
]


__version__ = "1.0.0"