"""
database/run_migrations.py

Execute Alembic database migrations.
"""

from alembic import command
from alembic.config import Config

from logging.logger import logger


def run_migrations() -> None:
    """
    Apply all pending migrations.
    """
    try:
        logger.info("Running database migrations...")

        alembic_cfg = Config("alembic.ini")

        command.upgrade(
            alembic_cfg,
            "head",
        )

        logger.info("Database migrations completed successfully.")

    except Exception as exc:
        logger.exception(
            "Migration execution failed.",
            exc_info=exc,
        )
        raise


if __name__ == "__main__":
    run_migrations()