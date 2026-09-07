"""
Cost Reporting Package.

Provides cost summaries, reports, dashboards, charts,
and export functionality for the ModelNow Cost Engine.
"""

from .summary import (
    CostSummary,
    SummaryBuilder,
)

from .reports import (
    CostReport,
    CostReportGenerator,
)

from .charts import (
    ChartData,
    CostChartBuilder,
)

from .dashboard import (
    Dashboard,
    DashboardBuilder,
)

from .exporter import (
    ReportExporter,
)


__all__ = [
    # Summary
    "CostSummary",
    "SummaryBuilder",

    # Reports
    "CostReport",
    "CostReportGenerator",

    # Charts
    "ChartData",
    "CostChartBuilder",

    # Dashboard
    "Dashboard",
    "DashboardBuilder",

    # Export
    "ReportExporter",
]


__version__ = "1.0.0"