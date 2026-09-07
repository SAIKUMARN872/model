"""
Chat pipeline stage.

Processes a chat request by invoking the configured AI service.
"""

from __future__ import annotations

from typing import Any, Protocol


class ChatProvider(Protocol):
    """
    Protocol that every chat provider must implement.
    """

    async def generate(
        self,
        *,
        prompt: str,
        context: dict[str, Any] | None = None,
    ) -> str: ...


class ChatPipelineStage:
    """
    Pipeline stage responsible for generating AI responses.
    """

    name = "chat"

    async def execute(
        self,
        pipeline_context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute the chat stage.

        Expected context:
        {
            "prompt": "...",
            "provider": ChatProvider,
            "context": {...}  # optional
        }
        """

        prompt = pipeline_context.get("prompt")
        provider = pipeline_context.get("provider")

        if not prompt:
            raise ValueError("Prompt is required.")

        if provider is None:
            raise ValueError("Chat provider is required.")

        response = await provider.generate(
            prompt=prompt,
            context=pipeline_context.get("context"),
        )

        pipeline_context["response"] = response

        return pipeline_context


chat_stage = ChatPipelineStage() 