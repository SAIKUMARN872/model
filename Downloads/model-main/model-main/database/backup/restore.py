"""
Database restore utilities.

Supports restoring PostgreSQL backups using psql.
"""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)


class RestoreError(Exception):
    """Raised when restoring a database backup fails."""


class RestoreService:
    """
    Service responsible for restoring PostgreSQL backups.
    """

    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    def restore_backup(self, backup_file: str | Path) -> None:
        """
        Restore a PostgreSQL database from a SQL backup file.

        Args:
            backup_file: Path to the .sql backup file.
        """
        backup_path = Path(backup_file)

        if not backup_path.exists():
            raise FileNotFoundError(
                f"Backup file not found: {backup_path}"
            )

        command = [
            "psql",
            self.database_url,
            "-f",
            str(backup_path),
        ]

        logger.info("Restoring database from %s", backup_path)

        try:
            subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as exc:
            logger.exception("Database restore failed")
            raise RestoreError(exc.stderr) from exc

        logger.info("Database restored successfully.")


def restore_database(
    database_url: str,
    backup_file: str | Path,
) -> None:
    """
    Convenience function to restore a database.
    """
    service = RestoreService(database_url)
    service.restore_backup(backup_file)


def restore_backup(
    database_url: str,
    backup_file: str | Path,
) -> None:
    """
    Alias for restore_database().
    """
    restore_database(database_url, backup_file)