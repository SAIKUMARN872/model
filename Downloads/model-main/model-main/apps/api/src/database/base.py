"""
Enterprise SQLAlchemy Base

Features
--------
✓ UUID Primary Keys
✓ Created At
✓ Updated At
✓ Soft Delete
✓ Version Control
✓ Naming Convention
✓ UTC Timestamps
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import MetaData
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import declared_attr


NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": (
        "fk_%(table_name)s_"
        "%(column_0_name)s_"
        "%(referred_table_name)s"
    ),
    "pk": "pk_%(table_name)s",
}


metadata = MetaData(
    naming_convention=NAMING_CONVENTION
)


class Base(DeclarativeBase):
    """
    Base Declarative Class.
    """

    metadata = metadata

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


class TimestampMixin:
    """
    Automatic timestamps.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class UUIDMixin:
    """
    UUID Primary Key.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class SoftDeleteMixin:
    """
    Soft Delete.
    """

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def delete(self) -> None:
        self.deleted_at = datetime.now(
            timezone.utc
        )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class VersionMixin:
    """
    Optimistic Locking.
    """

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )


class AuditMixin(
    UUIDMixin,
    TimestampMixin,
    SoftDeleteMixin,
    VersionMixin,
):
    """
    Enterprise Audit Mixin.

    Every production table should inherit this.
    """

    pass 