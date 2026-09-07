"""
database/seed_data.py

Seed initial data into the database.
"""

from sqlalchemy.orm import Session

from database.connection import SessionLocal
from logging.logger import logger

# Import your models
from database.models.user import User
from database.models.organization import Organization


class DatabaseSeeder:
    """
    Seed initial database records.
    """

    def __init__(self) -> None:
        self.db: Session = SessionLocal()

    def seed_organization(self) -> None:
        """
        Create default organization.
        """
        organization = (
            self.db.query(Organization)
            .filter(Organization.name == "Default Organization")
            .first()
        )

        if organization is None:
            organization = Organization(
                name="Default Organization",
                description="System Default Organization",
            )

            self.db.add(organization)
            self.db.commit()

            logger.info("Default organization created.")

    def seed_admin_user(self) -> None:
        """
        Create default admin user.
        """
        user = (
            self.db.query(User)
            .filter(User.email == "admin@example.com")
            .first()
        )

        if user is None:
            user = User(
                name="Administrator",
                email="admin@example.com",
                password="admin123",   # Replace with a hashed password
                is_active=True,
                is_admin=True,
            )

            self.db.add(user)
            self.db.commit()

            logger.info("Default admin user created.")

    def run(self) -> None:
        """
        Execute all seed operations.
        """
        try:
            logger.info("Starting database seeding...")

            self.seed_organization()
            self.seed_admin_user()

            logger.info("Database seeding completed successfully.")

        except Exception as exc:
            self.db.rollback()

            logger.exception(
                "Database seeding failed.",
                exc_info=exc,
            )

            raise

        finally:
            self.db.close()


def seed_database() -> None:
    """
    Seed the database.
    """
    DatabaseSeeder().run()


if __name__ == "__main__":
    seed_database()