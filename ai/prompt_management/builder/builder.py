from __future__ import annotations

from typing import Any

from ai.prompt_management.builder.composer import PromptComposer, PromptParts
from ai.prompt_management.builder.pipeline import PromptBuildPipeline
from ai.prompt_management.builder.utils import validate_text
from ai.prompt_management.engine import PromptManagementEngine
from ai.prompt_management.exceptions import PromptValidationError


class PromptBuilder:
    """Build prompts directly or render a registered prompt template."""

    def __init__(
        self,
        engine: PromptManagementEngine | None = None,
        composer: PromptComposer | None = None,
        pipeline: PromptBuildPipeline | None = None,
    ) -> None:
        self.engine = engine
        self.composer = composer or PromptComposer()
        self.pipeline = pipeline or PromptBuildPipeline()

    def build(
        self,
        user_input: str,
        *,
        system_instructions: str = "",
        context: str = "",
        additional_instructions: tuple[str, ...] = (),
        metadata: dict[str, Any] | None = None,
    ) -> str:
        parts = PromptParts(
            user_input=user_input,
            system_instructions=system_instructions,
            context=context,
            additional_instructions=additional_instructions,
            metadata={} if metadata is None else dict(metadata),
        )
        composed = self.composer.compose(parts)
        result = self.pipeline.run({
            "prompt": composed,
            "metadata": parts.metadata,
        })
        return validate_text(result.get("prompt"), "built prompt")

    def build_from_template(
        self,
        tenant_id: str,
        prompt_id: str,
        variables: dict[str, Any] | None = None,
        *,
        version: int | None = None,
    ) -> str:
        if self.engine is None:
            raise PromptValidationError(
                "An initialized PromptManagementEngine is required."
            )
        return self.engine.render(
            tenant_id, prompt_id, variables, version=version
        )
