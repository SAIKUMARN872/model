"""
Database backup utilities.

Supports creating PostgreSQL backups using pg_dump.
"""

from __future__ import annotations

import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class BackupError(Exception):
    """Raised when database backup fails."""


class BackupService:
    """
    Service responsible for creating PostgreSQL backups.
    """

    def __init__(
        self,
        database_url: str,
        backup_dir: str = "backups",
    ) -> None:
        self.database_url = database_url
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(
        self,
        filename: Optional[str] = None,
    ) -> Path:
        """
        Create a PostgreSQL database backup.

        Returns:
            Path to the backup file.
        """
        if filename is None:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"backup_{timestamp}.sql"

        backup_path = self.backup_dir / filename

        command = [
            "pg_dump",
            self.database_url,
            "-f",
            str(backup_path),
        ]

        logger.info("Creating database backup...")

        try:
            subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as exc:
            logger.exception("Backup failed")
            raise BackupError(exc.stderr) from exc

        logger.info("Backup created: %s", backup_path)

        return backup_path


def backup_database(
    database_url: str,
    backup_dir: str = "backups",
) -> Path:
    """
    Convenience function to create a backup.
    """
    service = BackupService(
        database_url=database_url,
        backup_dir=backup_dir,
    )

    return service.create_backup()


def create_backup(
    database_url: str,
    backup_dir: str = "backups",
) -> Path:
    """
    Alias for backup_database().
    """
    return backup_database(database_url, backup_dir)