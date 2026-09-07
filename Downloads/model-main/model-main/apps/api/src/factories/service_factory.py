"""
Service Factory

Responsible for creating application service instances.

Services contain business logic and coordinate:
- repositories
- providers
- external integrations
"""

from typing import Any, Dict, Type

from src.exceptions.validation import ValidationException


class ServiceFactory:
    """
    Factory for managing and creating services.
    """

    _services: Dict[str, Any] = {}


    @classmethod
    def register_service(
        cls,
        name: str,
        service: Any,
    ) -> None:
        """
        Register a service instance.

        Example:
            ServiceFactory.register_service(
                "user",
                UserService()
            )
        """

        cls._services[name.lower()] = service


    @classmethod
    def get_service(
        cls,
        name: str,
    ) -> Any:
        """
        Get already registered service.
        """

        service = cls._services.get(
            name.lower()
        )

        if not service:
            raise ValidationException(
                message=f"Service '{name}' not found"
            )

        return service


    @classmethod
    def create_service(
        cls,
        service_name: str,
        **dependencies: Any,
    ) -> Any:
        """
        Dynamically create service.

        Supported services:
        - user
        - auth
        - agent
        - document
        - chat
        """

        service_name = service_name.lower()


        factories = {
            "user": cls._create_user_service,
            "auth": cls._create_auth_service,
            "agent": cls._create_agent_service,
            "document": cls._create_document_service,
            "chat": cls._create_chat_service,
        }


        factory = factories.get(
            service_name
        )


        if not factory:
            raise ValidationException(
                message=(
                    f"Unsupported service: "
                    f"{service_name}"
                )
            )


        return factory(
            **dependencies
        )


    @staticmethod
    def _create_user_service(
        **dependencies,
    ):
        """
        Create User Service.
        """

        from src.domain.services.user_service import UserService

        return UserService(
            **dependencies
        )


    @staticmethod
    def _create_auth_service(
        **dependencies,
    ):
        """
        Create Authentication Service.
        """

        from src.domain.services.auth_service import AuthService

        return AuthService(
            **dependencies
        )


    @staticmethod
    def _create_agent_service(
        **dependencies,
    ):
        """
        Create AI Agent Service.
        """

        from src.domain.services.agent_service import AgentService

        return AgentService(
            **dependencies
        )


    @staticmethod
    def _create_document_service(
        **dependencies,
    ):
        """
        Create Document Processing Service.
        """

        from src.domain.services.document_service import DocumentService

        return DocumentService(
            **dependencies
        )


    @staticmethod
    def _create_chat_service(
        **dependencies,
    ):
        """
        Create Chat Service.
        """

        from src.domain.services.chat_service import ChatService

        return ChatService(
            **dependencies
        ) 