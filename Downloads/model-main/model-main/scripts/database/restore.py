"""
database/restore.py

Restore a PostgreSQL database from a SQL backup.
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

from config.config import settings
from logging.logger import logger


class DatabaseRestore:
    """
    Restore PostgreSQL database from a backup file.
    """

    async def restore(self, backup_file: str) -> None:
        backup_path = Path(backup_file)

        if not backup_path.exists():
            raise FileNotFoundError(
                f"Backup file not found: {backup_file}"
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

            process = await asyncio.create_subprocess_exec(
                *command,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            _, stderr = await process.communicate()

            if process.returncode != 0:
                raise RuntimeError(stderr.decode())

            logger.info("Database restored successfully.")

        except Exception as exc:
            logger.exception(
                "Database restore failed.",
                exc_info=exc,
            )
            raise


restore_manager = DatabaseRestore()


async def restore_database(backup_file: str) -> None:
    """
    Restore database from a SQL backup.
    """
    await restore_manager.restore(backup_file)


if __name__ == "__main__":
    asyncio.run(
        restore_database("backups/latest_backup.sql")
    )