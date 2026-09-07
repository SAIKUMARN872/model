"""
Agent Platform registry package.

Provides component registration, metadata,
validation and discovery.
"""

from .discovery import (
    ComponentDiscovery,
    DiscoveryQuery,
)

from .metadata import (
    AgentMetadata,
    ComponentMetadata,
    ModelMetadata,
    merge_metadata,
)

from .registry import (
    ComponentAlreadyRegisteredError,
    ComponentNotFoundError,
    ComponentRegistry,
    RegistryError,
)

from .validator import (
    RegistryValidationError,
    RegistryValidator,
)


__all__ = [
    # Discovery
    "ComponentDiscovery",
    "DiscoveryQuery",

    # Metadata
    "ComponentMetadata",
    "AgentMetadata",
    "ModelMetadata",
    "merge_metadata",

    # Registry
    "ComponentRegistry",
    "RegistryError",
    "ComponentAlreadyRegisteredError",
    "ComponentNotFoundError",

    # Validation
    "RegistryValidator",
    "RegistryValidationError",
]