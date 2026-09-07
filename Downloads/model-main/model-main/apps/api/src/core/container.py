"""
Dependency Injection Container

Enterprise Service Container

Responsibilities
----------------
- Register Services
- Register Repositories
- Register AI Clients
- Resolve Dependencies
"""

from __future__ import annotations

from typing import Any


class Container:
    """
    Enterprise Dependency Injection Container.
    """

    def __init__(self) -> None:
        self._services: dict[str, Any] = {}

    # ==========================================================
    # Register
    # ==========================================================

    def register(
        self,
        name: str,
        instance: Any,
    ) -> None:
        """
        Register a dependency.
        """

        self._services[name] = instance

    # ==========================================================
    # Resolve
    # ==========================================================

    def resolve(
        self,
        name: str,
    ) -> Any:
        """
        Resolve a dependency.
        """

        if name not in self._services:
            raise KeyError(
                f"Dependency '{name}' is not registered."
            )

        return self._services[name]

    # ==========================================================
    # Exists
    # ==========================================================

    def contains(
        self,
        name: str,
    ) -> bool:

        return name in self._services

    # ==========================================================
    # Remove
    # ==========================================================

    def remove(
        self,
        name: str,
    ) -> None:

        self._services.pop(name, None)

    # ==========================================================
    # Clear
    # ==========================================================

    def clear(self) -> None:

        self._services.clear()

    # ==========================================================
    # List
    # ==========================================================

    def keys(self) -> list[str]:

        return list(self._services.keys())

    # ==========================================================
    # Count
    # ==========================================================

    @property
    def count(self) -> int:

        return len(self._services)


# ==========================================================
# Singleton Container
# ==========================================================

container = Container() 