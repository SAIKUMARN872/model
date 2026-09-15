"""
Monitoring package for browser automation.
"""

from .logs import (
    AutomationLogger,
    LogRecord,
    logger,
)

from .metrics import (
    MetricTimer,
    MetricValue,
    MetricsRegistry,
    metrics,
)

from .traces import (
    Span,
    Trace,
    TraceManager,
    traces,
)


__all__ = [
    "AutomationLogger",
    "LogRecord",
    "logger",
    "MetricTimer",
    "MetricValue",
    "MetricsRegistry",
    "metrics",
    "Span",
    "Trace",
    "TraceManager",
    "traces",
]


__version__ = "1.0.0"