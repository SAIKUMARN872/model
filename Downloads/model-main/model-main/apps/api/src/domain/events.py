"""
Domain Events

Enterprise Event-Driven Architecture

Responsibilities
----------------
- Domain Events
- Event Metadata
- Event Serialization
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, UTC
from typing import Any
from uuid import uuid4


# ==========================================================
# Base Domain Event
# ==========================================================

@dataclass
class DomainEvent:
    """
    Base Domain Event
    """

    event_id: str = field(default_factory=lambda: str(uuid4()))
    event_name: str = ""
    occurred_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    aggregate_id: str = ""
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ==========================================================
# User Events
# ==========================================================

@dataclass
class UserCreatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "user.created"


@dataclass
class UserUpdatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "user.updated"


@dataclass
class UserDeletedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "user.deleted"


# ==========================================================
# Chat Events
# ==========================================================

@dataclass
class ChatCreatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "chat.created"


@dataclass
class ChatUpdatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "chat.updated"


@dataclass
class ChatDeletedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "chat.deleted"


# ==========================================================
# Model Events
# ==========================================================

@dataclass
class ModelCreatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "model.created"


@dataclass
class ModelUpdatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "model.updated"


@dataclass
class ModelDeletedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "model.deleted"


# ==========================================================
# File Events
# ==========================================================

@dataclass
class FileUploadedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "file.uploaded"


@dataclass
class FileDeletedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "file.deleted"


# ==========================================================
# Organization Events
# ==========================================================

@dataclass
class OrganizationCreatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "organization.created"


@dataclass
class OrganizationUpdatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "organization.updated"


# ==========================================================
# Agent Events
# ==========================================================

@dataclass
class AgentCreatedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "agent.created"


@dataclass
class AgentDeletedEvent(DomainEvent):

    def __post_init__(self):
        self.event_name = "agent.deleted" 