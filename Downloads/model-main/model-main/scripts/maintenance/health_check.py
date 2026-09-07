"""
maintenance/health_check.py

Application health check utilities.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from sqlalchemy import text

from database.connection import engine
from logging.logger import logger


class HealthCheck:
    """
    Performs application health checks.
    """

    def __init__(self) -> None:
        self.backup_dir = Path("backups")

    def check_database(self) -> bool:
        """
        Verify database connectivity.
        """
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))

            logger.info("Database health check passed.")
            return True

        except Exception as exc:
            logger.exception(
                "Database health check failed.",
                exc_info=exc,
            )
            return False

    def check_backup_directory(self) -> bool:
        """
        Verify backup directory exists.
        """
        try:
            self.backup_dir.mkdir(
                parents=True,
                exist_ok=True,
            )

            logger.info("Backup directory is available.")
            return True

        except Exception as exc:
            logger.exception(
                "Backup directory check failed.",
                exc_info=exc,
            )
            return False

    def check_disk_space(self) -> bool:
        """
        Verify sufficient disk space exists.
        """
        try:
            usage = shutil.disk_usage("/")

            free_gb = usage.free / (1024 ** 3)

            logger.info(
                "Available disk space: %.2f GB",
                free_gb,
            )

            return free_gb > 1

        except Exception as exc:
            logger.exception(
                "Disk space check failed.",
                exc_info=exc,
            )
            return False

    def run(self) -> dict:
        """
        Execute all health checks.
        """
        return {
            "database": self.check_database(),
            "backup_directory": self.check_backup_directory(),
            "disk_space": self.check_disk_space(),
        }


health_checker = HealthCheck()


def health_status() -> dict:
    """
    Return application health status.
    """
    return health_checker.run()


if __name__ == "__main__":
    status = health_status()

    print("\nApplication Health Status")
    print("-" * 30)

    for service, result in status.items():
        print(f"{service:<20}: {'Healthy' if result else 'Unhealthy'}")