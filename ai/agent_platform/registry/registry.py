"""
Central component registry for the Agent Platform.
"""

from __future__ import annotations

import logging
from threading import RLock
from typing import (
    Any,
    Dict,
    Iterable,
    List,
    Optional,
)

from .metadata import ComponentMetadata
from .validator import (
    RegistryValidationError,
    RegistryValidator,
)

logger = logging.getLogger(__name__)


class RegistryError(RuntimeError):
    """Base registry exception."""


class ComponentAlreadyRegisteredError(
    RegistryError
):
    """Raised when a component is already registered."""


class ComponentNotFoundError(
    RegistryError
):
    """Raised when a component is not found."""


class ComponentRegistry:
    """
    Thread-safe registry for platform components.

    Stores:
        component object
        component metadata
    """

    def __init__(
        self,
        *,
        validator: Optional[
            RegistryValidator
        ] = None,
    ):

        self._components: Dict[
            str,
            Any,
        ] = {}

        self._metadata: Dict[
            str,
            ComponentMetadata,
        ] = {}

        self._lock = RLock()

        self.validator = (
            validator
            or RegistryValidator()
        )

    def register(
        self,
        name: str,
        component: Any,
        metadata: ComponentMetadata,
        *,
        overwrite: bool = False,
    ) -> Any:

        name = self.validator.validate_name(
            name
        )

        self.validator.validate_component(
            name,
            component,
            metadata,
        )

        with self._lock:

            if (
                name in self._components
                and not overwrite
            ):
                raise ComponentAlreadyRegisteredError(
                    f"Component '{name}' "
                    f"is already registered."
                )

            self._components[name] = component
            self._metadata[name] = metadata

            logger.info(
                "Registered component: %s",
                name,
            )

            return component

    def unregister(
        self,
        name: str,
    ) -> Any:

        name = self.validator.validate_name(
            name
        )

        with self._lock:

            if name not in self._components:
                raise ComponentNotFoundError(
                    f"Component '{name}' "
                    f"is not registered."
                )

            component = self._components.pop(
                name
            )

            self._metadata.pop(
                name,
                None,
            )

            logger.info(
                "Unregistered component: %s",
                name,
            )

            return component

    def get(
        self,
        name: str,
    ) -> Any:

        name = self.validator.validate_name(
            name
        )

        with self._lock:

            if name not in self._components:
                raise ComponentNotFoundError(
                    f"Component '{name}' "
                    f"is not registered."
                )

            return self._components[name]

    def get_metadata(
        self,
        name: str,
    ) -> ComponentMetadata:

        name = self.validator.validate_name(
            name
        )

        with self._lock:

            if name not in self._metadata:
                raise ComponentNotFoundError(
                    f"Metadata for '{name}' "
                    f"was not found."
                )

            return self._metadata[name]

    def contains(
        self,
        name: str,
    ) -> bool:

        with self._lock:
            return name in self._components

    def enable(
        self,
        name: str,
    ) -> None:

        metadata = self.get_metadata(name)

        metadata.enabled = True

    def disable(
        self,
        name: str,
    ) -> None:

        metadata = self.get_metadata(name)

        metadata.enabled = False

    def is_enabled(
        self,
        name: str,
    ) -> bool:

        return self.get_metadata(name).enabled

    def list(
        self,
        *,
        component_type: Optional[str] = None,
        enabled_only: bool = False,
    ) -> List[str]:

        with self._lock:

            names = []

            for name, metadata in (
                self._metadata.items()
            ):

                if (
                    component_type is not None
                    and metadata.component_type
                    != component_type
                ):
                    continue

                if (
                    enabled_only
                    and not metadata.enabled
                ):
                    continue

                names.append(name)

            return sorted(names)

    def items(
        self,
    ) -> Iterable[tuple[str, Any]]:

        with self._lock:
            return tuple(
                self._components.items()
            )

    def metadata_items(
        self,
    ) -> Iterable[
        tuple[str, ComponentMetadata]
    ]:

        with self._lock:
            return tuple(
                self._metadata.items()
            )

    def count(
        self,
        *,
        component_type: Optional[str] = None,
    ) -> int:

        return len(
            self.list(
                component_type=component_type
            )
        )

    def clear(self) -> None:

        with self._lock:
            self._components.clear()
            self._metadata.clear()

            logger.info(
                "Registry cleared."
            )

    def export(self) -> Dict[str, Any]:

        with self._lock:

            return {
                name: metadata.to_dict()
                for name, metadata
                in self._metadata.items()
            }