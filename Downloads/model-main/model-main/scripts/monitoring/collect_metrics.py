"""
maintenance/collect_metrics.py

Collect basic application and system metrics.

Usage:
    python maintenance/collect_metrics.py

Requirements:
    pip install psutil loguru
"""

from __future__ import annotations

import json
import platform
from datetime import datetime
from pathlib import Path

import psutil
from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
METRICS_DIR = PROJECT_ROOT / "metrics"

METRICS_FILE = METRICS_DIR / "system_metrics.json"


class MetricsCollectionError(Exception):
    """Raised when metric collection fails."""


class MetricsCollector:
    """Collect and persist system metrics."""

    def __init__(self, output_file: Path) -> None:
        self.output_file = output_file

    def collect(self) -> dict:
        """Collect system metrics."""

        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        cpu = psutil.cpu_percent(interval=1)

        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "system": platform.system(),
            "hostname": platform.node(),
            "cpu": {
                "usage_percent": cpu,
                "cores": psutil.cpu_count(logical=False),
                "logical_cores": psutil.cpu_count(logical=True),
            },
            "memory": {
                "total": memory.total,
                "used": memory.used,
                "available": memory.available,
                "usage_percent": memory.percent,
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "usage_percent": disk.percent,
            },
        }

    def save(self, metrics: dict) -> None:
        """Save metrics to disk."""

        self.output_file.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with self.output_file.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                metrics,
                file,
                indent=4,
            )

        logger.success(
            "Metrics saved to {}",
            self.output_file,
        )


def collect_metrics() -> None:
    """Collect and save metrics."""

    try:
        collector = MetricsCollector(METRICS_FILE)

        metrics = collector.collect()

        collector.save(metrics)

    except Exception as exc:
        logger.exception("Metric collection failed.")
        raise MetricsCollectionError(
            "Unable to collect system metrics."
        ) from exc


if __name__ == "__main__":
    collect_metrics()