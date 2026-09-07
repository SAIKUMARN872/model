"""
database/migrations.py

Run Alembic migrations programmatically.
"""

from alembic import command
from alembic.config import Config

from logging.logger import logger


class MigrationManager:
    """
    Alembic migration manager.
    """

    def __init__(self, config_file: str = "alembic.ini") -> None:
        self.alembic_cfg = Config(config_file)

    def upgrade(self, revision: str = "head") -> None:
        """
        Upgrade database to a revision.
        """
        try:
            logger.info(f"Running upgrade -> {revision}")

            command.upgrade(self.alembic_cfg, revision)

            logger.info("Database upgraded successfully.")

        except Exception as exc:
            logger.exception(
                "Database upgrade failed.",
                exc_info=exc,
            )
            raise

    def downgrade(self, revision: str = "-1") -> None:
        """
        Downgrade database.
        """
        try:
            logger.info(f"Running downgrade -> {revision}")

            command.downgrade(self.alembic_cfg, revision)

            logger.info("Database downgraded successfully.")

        except Exception as exc:
            logger.exception(
                "Database downgrade failed.",
                exc_info=exc,
            )
            raise

    def current(self) -> None:
        """
        Show current migration revision.
        """
        command.current(self.alembic_cfg)

    def history(self) -> None:
        """
        Show migration history.
        """
        command.history(self.alembic_cfg)

    def revision(self, message: str) -> None:
        """
        Create a new migration revision.
        """
        try:
            logger.info(f"Creating migration: {message}")

            command.revision(
                self.alembic_cfg,
                autogenerate=True,
                message=message,
            )

            logger.info("Migration created successfully.")

        except Exception as exc:
            logger.exception(
                "Failed to create migration.",
                exc_info=exc,
            )
            raise


migration_manager = MigrationManager()


if __name__ == "__main__":
    migration_manager.upgrade()