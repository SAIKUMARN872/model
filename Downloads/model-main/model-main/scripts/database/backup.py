"""
database/backup.py

Database backup utility.
Creates PostgreSQL backups using pg_dump.
"""

from __future__ import annotations

import asyncio
import os
from datetime import datetime
from pathlib import Path

from config.config import settings
from logging.logger import logger


class DatabaseBackup:
    """
    PostgreSQL database backup manager.
    """

    def __init__(self) -> None:
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    async def create_backup(self) -> str:
        """
        Create a database backup.

        Returns:
            Path of the generated backup file.
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
            "-h",
            settings.POSTGRES_HOST,
            "-p",
            str(settings.POSTGRES_PORT),
            "-U",
            settings.POSTGRES_USER,
            "-F",
            "p",
            "-f",
            str(backup_file),
            settings.POSTGRES_DB,
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            _, stderr = await process.communicate()

            if process.returncode != 0:
                error = stderr.decode().strip()
                logger.error(f"Backup failed: {error}")
                raise RuntimeError(error)

            logger.info(f"Database backup created: {backup_file}")

            return str(backup_file)

        except Exception as exc:
            logger.exception("Database backup failed", exc_info=exc)
            raise


backup_manager = DatabaseBackup()


async def backup_database() -> str:
    """
    Convenience function.

    Returns:
        Backup file path.
    """
    return await backup_manager.create_backup()


if __name__ == "__main__":
    asyncio.run(backup_database())