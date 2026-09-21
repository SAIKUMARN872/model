"""
User Database Model

Contains:
- User entity
- Authentication information
- Role relationship
- Account status
- Audit timestamps
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    String,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.database.base import Base



class User(Base):
    """
    User ORM Model.

    Represents application users.
    """

    __tablename__ = "users"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )


    username = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )


    email = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )


    hashed_password = Column(
        String(255),
        nullable=False,
    )


    full_name = Column(
        String(150),
        nullable=True,
    )


    phone_number = Column(
        String(20),
        nullable=True,
    )


    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "roles.id"
        ),
        nullable=True,
    )


    is_active = Column(
        Boolean,
        default=True,
    )


    is_verified = Column(
        Boolean,
        default=False,
    )


    last_login = Column(
        DateTime,
        nullable=True,
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


    # ======================
    # Relationships
    # ======================

    role = relationship(
        "Role",
        back_populates="users",
    )


    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )


    documents = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete-orphan",
    )


    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )


    def __repr__(self):
        return (
            f"<User "
            f"id={self.id} "
            f"email={self.email}>"
        ) 