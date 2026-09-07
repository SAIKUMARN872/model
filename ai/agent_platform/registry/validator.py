"""
Registry validation utilities.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Iterable, List, Optional

from .metadata import ComponentMetadata


class RegistryValidationError(ValueError):
    """Raised when registry data is invalid."""


class RegistryValidator:
    """
    Validates component registrations and metadata.
    """

    NAME_PATTERN = re.compile(
        r"^[a-zA-Z0-9_.:@/-]+$"
    )

    VERSION_PATTERN = re.compile(
        r"^\d+\.\d+\.\d+$"
    )

    VALID_TYPES = {
        "agent",
        "model",
        "tool",
        "provider",
        "workflow",
        "component",
    }

    def validate_name(
        self,
        name: str,
    ) -> str:

        if not isinstance(name, str):
            raise RegistryValidationError(
                "Registry name must be a string."
            )

        name = name.strip()

        if not name:
            raise RegistryValidationError(
                "Registry name cannot be empty."
            )

        if len(name) > 255:
            raise RegistryValidationError(
                "Registry name cannot exceed 255 characters."
            )

        if not self.NAME_PATTERN.match(name):
            raise RegistryValidationError(
                f"Invalid registry name: {name}"
            )

        return name

    def validate_type(
        self,
        component_type: str,
    ) -> str:

        if not isinstance(
            component_type,
            str,
        ):
            raise RegistryValidationError(
                "component_type must be a string."
            )

        component_type = (
            component_type.strip().lower()
        )

        if component_type not in self.VALID_TYPES:
            raise RegistryValidationError(
                f"Unsupported component type: "
                f"{component_type}"
            )

        return component_type

    def validate_version(
        self,
        version: str,
    ) -> str:

        if not isinstance(version, str):
            raise RegistryValidationError(
                "version must be a string."
            )

        if not self.VERSION_PATTERN.match(
            version
        ):
            raise RegistryValidationError(
                "Version must use semantic "
                "versioning: X.Y.Z"
            )

        return version

    def validate_metadata(
        self,
        metadata: ComponentMetadata,
    ) -> ComponentMetadata:

        self.validate_name(metadata.name)

        self.validate_type(
            metadata.component_type
        )

        self.validate_version(
            metadata.version
        )

        if not isinstance(
            metadata.capabilities,
            list,
        ):
            raise RegistryValidationError(
                "capabilities must be a list."
            )

        if not isinstance(
            metadata.tags,
            list,
        ):
            raise RegistryValidationError(
                "tags must be a list."
            )

        return metadata

    def validate_component(
        self,
        name: str,
        component: Any,
        metadata: ComponentMetadata,
    ) -> None:

        self.validate_metadata(metadata)

        if component is None:
            raise RegistryValidationError(
                f"Component '{name}' cannot be None."
            )

    def validate_bulk(
        self,
        items: Iterable[
            ComponentMetadata
        ],
    ) -> List[ComponentMetadata]:

        validated = []

        for item in items:
            validated.append(
                self.validate_metadata(item)
            )

        return validated