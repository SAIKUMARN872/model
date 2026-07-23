"""
Service registry.

Manages application service registration
and dependency resolution.

Used for:
- AI services
- Authentication services
- Chat services
- File services
- Business logic services
"""

from __future__ import annotations

from typing import Any, Type

from app.core.logging import logger



class ServiceRegistry:
    """
    Central service container.

    Provides registration and retrieval
    of application services.
    """

    def __init__(self) -> None:

        self._services: dict[str, Any] = {}



    def register(
        self,
        name: str,
        service: Any,
    ) -> None:
        """
        Register a service instance.

        Example:

            registry.register(
                "chat_service",
                ChatService()
            )
        """

        if name in self._services:

            logger.warning(
                "Service already registered: %s",
                name,
            )


        self._services[name] = service


        logger.info(
            "Service registered: %s",
            name,
        )



    def register_class(
        self,
        name: str,
        service_class: Type[Any],
    ) -> None:
        """
        Register service class.

        Instance is created automatically.
        """

        self._services[name] = service_class()


        logger.info(
            "Service class registered: %s",
            name,
        )



    def get(
        self,
        name: str,
    ) -> Any:
        """
        Retrieve service instance.
        """

        service = self._services.get(
            name,
        )


        if service is None:

            raise KeyError(
                f"Service not found: {name}"
            )


        return service



    def exists(
        self,
        name: str,
    ) -> bool:
        """
        Check service existence.
        """

        return name in self._services



    def remove(
        self,
        name: str,
    ) -> None:
        """
        Remove registered service.
        """

        if name in self._services:

            del self._services[name]


            logger.info(
                "Service removed: %s",
                name,
            )



    def list_services(
        self,
    ) -> list[str]:
        """
        List registered services.
        """

        return list(
            self._services.keys()
        )



    def clear(
        self,
    ) -> None:
        """
        Remove all services.
        """

        self._services.clear()


        logger.info(
            "All services cleared.",
        )



    def get_all(
        self,
    ) -> dict[str, Any]:
        """
        Return all services.
        """

        return self._services.copy()



# Global service registry instance

service_registry = ServiceRegistry()