"""
backup/backup_database.py

Utility for creating PostgreSQL database backups.
"""

from __future__ import annotations

import subprocess
from datetime import datetime
from pathlib import Path
import os

from config.config import settings
from logging.logger import logger


class DatabaseBackup:
    """
    Handles PostgreSQL database backups.
    """

    def __init__(self) -> None:
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def backup(self) -> str:
        """
        Create a database backup.

        Returns:
            Path to the generated backup file.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        backup_file = (
            self.backup_dir
            / f"{settings.POSTGRES_DB}_{timestamp}.sql"
        )

        env = os.environ.copy()
        env["PGPASSWORD"] = settings.POSTGRES_PASSWORD

        command = [
            "pg_dump",
            "-h", settings.POSTGRES_HOST,
            "-p", str(settings.POSTGRES_PORT),
            "-U", settings.POSTGRES_USER,
            "-F", "p",
            "-f", str(backup_file),
            settings.POSTGRES_DB,
        ]

        try:
            logger.info("Starting database backup...")

            subprocess.run(
                command,
                env=env,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            logger.info(
                "Database backup completed successfully: %s",
                backup_file,
            )

            return str(backup_file)

        except subprocess.CalledProcessError as exc:
            logger.exception(
                "Database backup failed.",
                exc_info=exc,
            )
            raise


backup_manager = DatabaseBackup()


def backup_database() -> str:
    """
    Execute a database backup.
    """
    return backup_manager.backup()


if __name__ == "__main__":
    backup_database()