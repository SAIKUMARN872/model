"""
maintenance/cleanup_logs.py

Utility to clean up old log files.

Usage:
    python maintenance/cleanup_logs.py

Example:
    python maintenance/cleanup_logs.py --days 30
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGS_DIR = PROJECT_ROOT / "logs"


class LogCleanupError(Exception):
    """Raised when log cleanup fails."""


class LogCleaner:
    """Delete log files older than a specified number of days."""

    def __init__(
        self,
        logs_dir: Path,
        retention_days: int = 30,
    ) -> None:
        self.logs_dir = logs_dir
        self.retention_days = retention_days

    def cleanup(self) -> None:
        """Remove expired log files."""

        if not self.logs_dir.exists():
            logger.warning(
                "Logs directory does not exist: {}",
                self.logs_dir,
            )
            return

        cutoff = datetime.now() - timedelta(days=self.retention_days)

        deleted = 0

        for file in self.logs_dir.rglob("*"):
            if not file.is_file():
                continue

            if file.suffix.lower() not in {
                ".log",
                ".txt",
            }:
                continue

            modified = datetime.fromtimestamp(
                file.stat().st_mtime,
            )

            if modified < cutoff:
                logger.info("Deleting {}", file)

                file.unlink(missing_ok=True)

                deleted += 1

        logger.success(
            "Log cleanup completed. {} file(s) deleted.",
            deleted,
        )


def cleanup_logs(days: int = 30) -> None:
    """Run log cleanup."""

    try:
        cleaner = LogCleaner(
            logs_dir=LOGS_DIR,
            retention_days=days,
        )

        cleaner.cleanup()

    except Exception as exc:
        logger.exception("Log cleanup failed.")
        raise LogCleanupError(
            "Unable to clean log files."
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Clean up old log files."
    )

    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Delete logs older than this many days.",
    )

    args = parser.parse_args()

    cleanup_logs(args.days)


if __name__ == "__main__":
    main()