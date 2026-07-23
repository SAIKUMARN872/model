"""
maintenance/cleanup.py

Cleanup utility for removing old backups and log files.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from config.config import settings
from logging.logger import logger


class CleanupManager:
    """
    Removes old backup and log files.
    """

    def __init__(self) -> None:
        self.backup_dir = Path("backups")
        self.log_dir = Path("logs")

        self.retention_days = getattr(
            settings,
            "BACKUP_RETENTION_DAYS",
            30,
        )

    def cleanup_backups(self) -> int:
        """
        Delete backup files older than the retention period.

        Returns:
            Number of deleted backup files.
        """
        if not self.backup_dir.exists():
            return 0

        deleted = 0
        cutoff = datetime.now() - timedelta(days=self.retention_days)

        for file in self.backup_dir.glob("*.sql"):
            modified = datetime.fromtimestamp(file.stat().st_mtime)

            if modified < cutoff:
                file.unlink()
                deleted += 1
                logger.info("Deleted backup: %s", file.name)

        return deleted

    def cleanup_logs(self) -> int:
        """
        Delete old log files.

        Returns:
            Number of deleted log files.
        """
        if not self.log_dir.exists():
            return 0

        deleted = 0
        cutoff = datetime.now() - timedelta(days=self.retention_days)

        for file in self.log_dir.glob("*.log"):
            modified = datetime.fromtimestamp(file.stat().st_mtime)

            if modified < cutoff:
                file.unlink()
                deleted += 1
                logger.info("Deleted log: %s", file.name)

        return deleted

    def run(self) -> None:
        """
        Run all cleanup tasks.
        """
        logger.info("Starting maintenance cleanup...")

        backups = self.cleanup_backups()
        logs = self.cleanup_logs()

        logger.info(
            "Cleanup completed. Backups removed: %d, Logs removed: %d",
            backups,
            logs,
        )


cleanup_manager = CleanupManager()


def run_cleanup() -> None:
    """
    Execute maintenance cleanup.
    """
    cleanup_manager.run()


if __name__ == "__main__":
    run_cleanup()