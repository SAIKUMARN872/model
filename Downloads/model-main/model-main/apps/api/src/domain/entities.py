"""
Domain Entities

Enterprise Domain Models

Responsibilities
----------------
- Business Entities
- Domain Objects
- Common Entity Behaviour
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, UTC
from uuid import uuid4


# ==========================================================
# Base Entity
# ==========================================================

@dataclass
class BaseEntity:
    """
    Base Domain Entity
    """

    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def touch(self) -> None:
        """
        Update modification timestamp.
        """
        self.updated_at = datetime.now(UTC)


# ==========================================================
# User Entity
# ==========================================================

@dataclass
class User(BaseEntity):
    email: str = ""
    full_name: str = ""
    password_hash: str = ""
    role: str = "user"
    is_active: bool = True


# ==========================================================
# Organization Entity
# ==========================================================

@dataclass
class Organization(BaseEntity):
    name: str = ""
    description: str = ""
    owner_id: str = ""


# ==========================================================
# AI Model Entity
# ==========================================================

@dataclass
class Model(BaseEntity):
    provider: str = ""
    model_name: str = ""
    version: str = ""
    enabled: bool = True


# ==========================================================
# Chat Entity
# ==========================================================

@dataclass
class Chat(BaseEntity):
    user_id: str = ""
    title: str = ""
    provider: str = ""
    model: str = ""


# ==========================================================
# Message Entity
# ==========================================================

@dataclass
class Message(BaseEntity):
    chat_id: str = ""
    role: str = ""
    content: str = ""
    token_count: int = 0


# ==========================================================
# File Entity
# ==========================================================

@dataclass
class File(BaseEntity):
    user_id: str = ""
    filename: str = ""
    content_type: str = ""
    size: int = 0
    storage_url: str = ""


# ==========================================================
# Agent Entity
# ==========================================================

@dataclass
class Agent(BaseEntity):
    name: str = ""
    description: str = ""
    provider: str = ""
    model: str = ""
    enabled: bool = True


# ==========================================================
# API Key Entity
# ==========================================================

@dataclass
class ApiKey(BaseEntity):
    user_id: str = ""
    key: str = ""
    expires_at: datetime | None = None
    active: bool = True 