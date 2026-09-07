"""
Connection table definition.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Connection(BaseModel):
    """
    Stores connection configurations for databases,
    APIs, vector stores, cloud services, etc.
    """

    __tablename__ = "connections"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    connection_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    host: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    port: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    username: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    password: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    database_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    connection_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    configuration: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    organization_id: Mapped[int | None] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_connected_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    organization = relationship(
        "Organization",
        back_populates="connections",
    )

    user = relationship(
        "User",
        back_populates="connections",
    )

    def __repr__(self) -> str:
        return (
            f"<Connection(id={self.id}, "
            f"name='{self.name}', "
            f"type='{self.connection_type}')>"
        )