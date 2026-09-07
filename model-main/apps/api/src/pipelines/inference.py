"""
Inference pipeline stage.

Executes AI model inference using the configured provider and
stores the generated output in the pipeline context.
"""

from __future__ import annotations

from typing import Any, Protocol


class InferenceProvider(Protocol):
    """
    Protocol that every inference provider must implement.
    """

    async def infer(
        self,
        *,
        prompt: str,
        **kwargs: Any,
    ) -> Any:
        """
        Run inference.
        """
        ...


class InferencePipelineStage:
    """
    Pipeline stage responsible for AI inference.
    """

    name = "inference"

    async def execute(
        self,
        pipeline_context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Expected context:
        {
            "provider": InferenceProvider,
            "prompt": "...",
            "parameters": {...}  # optional
        }
        """

        provider = pipeline_context.get("provider")
        prompt = pipeline_context.get("prompt")

        if provider is None:
            raise ValueError("Inference provider is required.")

        if not prompt:
            raise ValueError("Prompt is required.")

        parameters = pipeline_context.get("parameters", {})

        result = await provider.infer(
            prompt=prompt,
            **parameters,
        )

        pipeline_context["result"] = result
        pipeline_context["inference_completed"] = True

        return pipeline_context


inference_stage = InferencePipelineStage()