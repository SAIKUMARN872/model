"""
backup/restore_database.py

Restore a PostgreSQL database from a SQL backup.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

from config.config import settings
from logging.logger import logger


class DatabaseRestore:
    """
    Restore PostgreSQL database from a SQL backup file.
    """

    def __init__(self) -> None:
        self.backup_dir = Path("backups")

    def restore(self, backup_file: str) -> None:
        """
        Restore the database from the given SQL backup.

        Args:
            backup_file: Path to the SQL backup file.
        """

        backup_path = Path(backup_file)

        if not backup_path.exists():
            raise FileNotFoundError(
                f"Backup file does not exist: {backup_file}"
            )

        env = os.environ.copy()
        env["PGPASSWORD"] = settings.POSTGRES_PASSWORD

        command = [
            "psql",
            "-h",
            settings.POSTGRES_HOST,
            "-p",
            str(settings.POSTGRES_PORT),
            "-U",
            settings.POSTGRES_USER,
            "-d",
            settings.POSTGRES_DB,
            "-f",
            str(backup_path),
        ]

        try:
            logger.info("Starting database restore...")

            subprocess.run(
                command,
                env=env,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            logger.info("Database restored successfully.")

        except subprocess.CalledProcessError as exc:
            logger.exception(
                "Database restore failed.",
                exc_info=exc,
            )
            raise RuntimeError(exc.stderr) from exc


restore_manager = DatabaseRestore()


def restore_database(backup_file: str) -> None:
    """
    Restore the PostgreSQL database.

    Args:
        backup_file: SQL backup file path.
    """
    restore_manager.restore(backup_file)


if __name__ == "__main__":
    restore_database("backups/sample_backup.sql")