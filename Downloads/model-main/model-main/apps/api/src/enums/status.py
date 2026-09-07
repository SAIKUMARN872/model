"""
Application Status Enums

Enterprise Status Definitions
"""

from __future__ import annotations

from enum import Enum


# ==========================================================
# Generic Status
# ==========================================================

class Status(str, Enum):
    """
    Generic Status
    """

    ACTIVE = "active"
    INACTIVE = "inactive"
    ENABLED = "enabled"
    DISABLED = "disabled"
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    DELETED = "deleted"


# ==========================================================
# User Status
# ==========================================================

class UserStatus(str, Enum):
    """
    User Account Status
    """

    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"
    LOCKED = "locked"
    DELETED = "deleted"


# ==========================================================
# Chat Status
# ==========================================================

class ChatStatus(str, Enum):
    """
    Chat Status
    """

    CREATED = "created"
    ACTIVE = "active"
    STREAMING = "streaming"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ==========================================================
# Message Status
# ==========================================================

class MessageStatus(str, Enum):
    """
    Message Status
    """

    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"


# ==========================================================
# Model Status
# ==========================================================

class ModelStatus(str, Enum):
    """
    AI Model Status
    """

    AVAILABLE = "available"
    LOADING = "loading"
    READY = "ready"
    BUSY = "busy"
    DISABLED = "disabled"
    ERROR = "error"


# ==========================================================
# Task Status
# ==========================================================

class TaskStatus(str, Enum):
    """
    Background Task Status
    """

    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILURE = "failure"
    RETRY = "retry"
    CANCELLED = "cancelled"


# ==========================================================
# Job Status
# ==========================================================

class JobStatus(str, Enum):
    """
    Job Status
    """

    CREATED = "created"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ==========================================================
# File Status
# ==========================================================

class FileStatus(str, Enum):
    """
    File Processing Status
    """

    UPLOADED = "uploaded"
    PROCESSING = "processing"
    INDEXED = "indexed"
    READY = "ready"
    FAILED = "failed"
    DELETED = "deleted"


# ==========================================================
# Organization Status
# ==========================================================

class OrganizationStatus(str, Enum):
    """
    Organization Status
    """

    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


# ==========================================================
# API Status
# ==========================================================

class APIStatus(str, Enum):
    """
    API Health Status
    """

    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance" 