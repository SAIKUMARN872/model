"""
Model service.

Handles AI model management, model discovery,
default model configuration, and model health checks.
"""

from __future__ import annotations

from typing import Any

from app.repositories.model import ModelRepository
from app.schemas.model import (
    ModelResponse,
    ModelHealthResponse,
)


class ModelService:
    """
    AI Model business logic layer.
    """

    def __init__(
        self,
        repository: ModelRepository | None = None,
    ) -> None:

        self._repository = repository or ModelRepository()


    async def list_models(
        self,
    ) -> list[ModelResponse]:
        """
        Retrieve all available AI models.
        """

        models = await self._repository.list_models()

        return [
            ModelResponse.model_validate(
                model,
                from_attributes=True,
            )
            for model in models
        ]


    async def get_model(
        self,
        model_id: str,
    ) -> ModelResponse | None:
        """
        Retrieve a model by ID.
        """

        model = await self._repository.get_model(
            model_id,
        )

        if not model:
            return None


        return ModelResponse.model_validate(
            model,
            from_attributes=True,
        )


    async def create_model(
        self,
        data: dict[str, Any],
    ) -> ModelResponse:
        """
        Create a new AI model configuration.
        """

        model = await self._repository.create(
            data,
        )

        return ModelResponse.model_validate(
            model,
            from_attributes=True,
        )


    async def update_model(
        self,
        model_id: str,
        data: dict[str, Any],
    ) -> ModelResponse:
        """
        Update AI model configuration.
        """

        model = await self._repository.update(
            model_id,
            data,
        )

        return ModelResponse.model_validate(
            model,
            from_attributes=True,
        )


    async def delete_model(
        self,
        model_id: str,
    ) -> None:
        """
        Delete AI model.
        """

        await self._repository.delete(
            model_id,
        )


    async def get_default_model(
        self,
    ) -> ModelResponse | None:
        """
        Return configured default AI model.
        """

        model = await self._repository.get_default_model()

        if not model:
            return None


        return ModelResponse.model_validate(
            model,
            from_attributes=True,
        )


    async def set_default_model(
        self,
        model_id: str,
        updated_by: str,
    ) -> ModelResponse:
        """
        Set default AI model.
        """

        model = await self._repository.set_default_model(
            model_id=model_id,
            updated_by=updated_by,
        )

        return ModelResponse.model_validate(
            model,
            from_attributes=True,
        )


    async def health(
        self,
        model_id: str,
    ) -> dict[str, Any]:
        """
        Check model availability.
        """

        model = await self._repository.get_model(
            model_id,
        )

        if not model:
            return {
                "model": model_id,
                "status": "unavailable",
                "available": False,
            }


        health = await self._repository.check_health(
            model,
        )


        return health


    async def list_providers(
        self,
    ) -> list[str]:
        """
        List supported AI providers.
        """

        return await self._repository.list_providers()


    async def get_usage(
        self,
        model_id: str,
    ) -> dict[str, Any]:
        """
        Retrieve model usage statistics.
        """

        return await self._repository.get_usage(
            model_id,
        )


    async def count_tokens(
        self,
        model_id: str,
        text: str,
    ) -> int:
        """
        Count tokens for a model.
        """

        return await self._repository.count_tokens(
            model_id=model_id,
            text=text,
        )