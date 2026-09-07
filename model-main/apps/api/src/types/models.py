"""
Model type definitions.

Contains shared typing contracts related to
database models, entities, ORM objects, and model states.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Protocol, TypeAlias
from uuid import UUID


# -----------------------------
# Database Model Types
# -----------------------------

ModelID: TypeAlias = UUID


# -----------------------------
# Model State
# -----------------------------

ModelStatus: TypeAlias = str


ActiveStatus: ModelStatus = "active"

InactiveStatus: ModelStatus = "inactive"

DeletedStatus: ModelStatus = "deleted"



# -----------------------------
# ORM Model Protocol
# -----------------------------

class ORMModel(Protocol):
    """
    Base ORM model contract.
    """

    id: UUID

    created_at: datetime

    updated_at: datetime



# -----------------------------
# AI Model Types
# -----------------------------

ProviderName: TypeAlias = str


ModelName: TypeAlias = str


ModelVersion: TypeAlias = str



class AIModelConfig(Protocol):
    """
    AI model configuration contract.
    """

    name: ModelName

    provider: ProviderName

    version: ModelVersion



# -----------------------------
# Model Metadata
# -----------------------------

ModelMetadata: TypeAlias = dict[str, Any]



# -----------------------------
# Model Parameters
# -----------------------------

ModelParameters: TypeAlias = dict[
    str,
    Any,
]



# -----------------------------
# Model Capabilities
# -----------------------------

ModelCapability: TypeAlias = str


TextGeneration: ModelCapability = "text_generation"

EmbeddingGeneration: ModelCapability = "embedding"

ImageGeneration: ModelCapability = "image_generation"

AudioGeneration: ModelCapability = "audio_generation"



# -----------------------------
# Model Usage
# -----------------------------

TokenCount: TypeAlias = int


CostAmount: TypeAlias = float



__all__ = [
    # IDs
    "ModelID",

    # Status
    "ModelStatus",
    "ActiveStatus",
    "InactiveStatus",
    "DeletedStatus",

    # ORM
    "ORMModel",

    # AI Models
    "ProviderName",
    "ModelName",
    "ModelVersion",
    "AIModelConfig",

    # Metadata
    "ModelMetadata",
    "ModelParameters",

    # Capabilities
    "ModelCapability",
    "TextGeneration",
    "EmbeddingGeneration",
    "ImageGeneration",
    "AudioGeneration",

    # Usage
    "TokenCount",
    "CostAmount",
]