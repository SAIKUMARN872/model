"""
Default AI model seeder.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres.tables.model import AIModel


DEFAULT_MODELS = [
    {
        "name": "gpt-4o",
        "provider": "OpenAI",
        "version": "latest",
        "description": "GPT-4 Omni",
        "context_window": 128000,
        "max_output_tokens": 16384,
        "supports_streaming": True,
        "supports_tools": True,
        "supports_vision": True,
        "is_active": True,
    },
    {
        "name": "gpt-4.1",
        "provider": "OpenAI",
        "version": "latest",
        "description": "GPT-4.1",
        "context_window": 1000000,
        "max_output_tokens": 32768,
        "supports_streaming": True,
        "supports_tools": True,
        "supports_vision": True,
        "is_active": True,
    },
    {
        "name": "claude-4-sonnet",
        "provider": "Anthropic",
        "version": "latest",
        "description": "Claude 4 Sonnet",
        "context_window": 200000,
        "max_output_tokens": 8192,
        "supports_streaming": True,
        "supports_tools": True,
        "supports_vision": True,
        "is_active": True,
    },
    {
        "name": "gemini-2.5-pro",
        "provider": "Google",
        "version": "latest",
        "description": "Gemini 2.5 Pro",
        "context_window": 1000000,
        "max_output_tokens": 65536,
        "supports_streaming": True,
        "supports_tools": True,
        "supports_vision": True,
        "is_active": True,
    },
    {
        "name": "llama-3.3-70b",
        "provider": "Meta",
        "version": "latest",
        "description": "Llama 3.3 70B",
        "context_window": 131072,
        "max_output_tokens": 8192,
        "supports_streaming": True,
        "supports_tools": False,
        "supports_vision": False,
        "is_active": True,
    },
]


async def seed_default_models(
    session: AsyncSession,
) -> None:
    """
    Seed default AI models.
    """

    for data in DEFAULT_MODELS:

        result = await session.execute(
            select(AIModel).where(
                AIModel.name == data["name"]
            )
        )

        model = result.scalar_one_or_none()

        if model is None:
            session.add(
                AIModel(**data)
            )

    await session.commit()