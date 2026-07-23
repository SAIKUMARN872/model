"""
Database background workers.

This module contains asynchronous database maintenance jobs such as:

- Health checks
- Cleanup jobs
- Retry queue processing
- Periodic maintenance
"""

from __future__ import annotations

import asyncio
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.database.session import AsyncSessionLocal
from src.core.logging import logger


class DatabaseWorker:
    """
    Executes background database operations.
    """

    @staticmethod
    async def health_check() -> bool:
        """
        Verify that the database is reachable.
        """

        async with AsyncSessionLocal() as session:
            try:
                await session.execute(text("SELECT 1"))

                logger.info(
                    "Database health check completed successfully."
                )

                return True

            except SQLAlchemyError:
                logger.exception(
                    "Database health check failed."
                )
                return False

    @staticmethod
    async def cleanup_expired_records() -> None:
        """
        Cleanup expired records.

        Replace the SQL below with your own cleanup logic.
        """

        async with AsyncSessionLocal() as session:
            try:
                # Example SQL
                # await session.execute(
                #     text(
                #         "DELETE FROM audit_logs "
                #         "WHERE created_at < NOW() - INTERVAL '90 days'"
                #     )
                # )

                await session.commit()

                logger.info(
                    "Database cleanup completed successfully."
                )

            except SQLAlchemyError:
                await session.rollback()

                logger.exception(
                    "Database cleanup failed."
                )

    @staticmethod
    async def retry_failed_jobs() -> None:
        """
        Retry failed database jobs.
        """

        async with AsyncSessionLocal() as session:
            try:
                # Fetch failed jobs here
                # Process them
                # Update status

                await session.commit()

                logger.info(
                    "Retry job completed."
                )

            except SQLAlchemyError:
                await session.rollback()

                logger.exception(
                    "Retry job failed."
                )

    @staticmethod
    async def optimize_database() -> None:
        """
        Database optimization task.
        """

        async with AsyncSessionLocal() as session:
            try:
                # PostgreSQL examples:
                # await session.execute(text("VACUUM"))
                # await session.execute(text("ANALYZE"))

                await session.commit()

                logger.info(
                    "Database optimization completed."
                )

            except SQLAlchemyError:
                await session.rollback()

                logger.exception(
                    "Database optimization failed."
                )


async def database_worker_loop(interval: int = 300) -> None:
    """
    Runs periodic database maintenance tasks.

    Default interval: 5 minutes.
    """

    logger.info("Database worker started.")

    while True:
        await DatabaseWorker.health_check()
        await DatabaseWorker.cleanup_expired_records()
        await DatabaseWorker.retry_failed_jobs()

        await asyncio.sleep(interval)