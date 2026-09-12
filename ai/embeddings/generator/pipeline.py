"""
Generation pipeline for ModelNow.
"""

from __future__ import annotations

import asyncio
import inspect
from dataclasses import dataclass, field
from typing import Any, Callable

from .encoder import (
    PromptEncoder,
)
from .generator import (
    GenerationConfig,
    GenerationResult,
    TextGenerator,
)
from .utils import (
    batch_items,
    normalize_text,
    validate_prompts,
)


@dataclass
class PipelineConfig:
    """
    Configuration for the generation pipeline.
    """

    batch_size: int = 8

    concurrency: int = 4

    preprocess_prompt: bool = True

    postprocess_output: bool = True

    include_metadata: bool = True

    generation_config: GenerationConfig = field(
        default_factory=GenerationConfig
    )

    def __post_init__(self) -> None:

        if self.batch_size <= 0:

            raise ValueError(
                "batch_size must be positive"
            )

        if self.concurrency <= 0:

            raise ValueError(
                "concurrency must be positive"
            )


class GenerationPipeline:
    """
    End-to-end generation pipeline.

    Flow:

        input
          ↓
        validation
          ↓
        preprocessing
          ↓
        generator
          ↓
        postprocessing
          ↓
        result
    """

    def __init__(
        self,
        generator: TextGenerator,
        encoder: PromptEncoder | None = None,
        config: PipelineConfig | None = None,
        preprocessors: list[
            Callable[[str], str]
        ] | None = None,
        postprocessors: list[
            Callable[[str], str]
        ] | None = None,
    ) -> None:

        self.generator = generator

        self.encoder = (
            encoder
            or generator.encoder
            or PromptEncoder()
        )

        self.config = (
            config
            or PipelineConfig()
        )

        self.preprocessors = (
            preprocessors or []
        )

        self.postprocessors = (
            postprocessors or []
        )

    # --------------------------------------------------
    # Single prompt
    # --------------------------------------------------

    def run(
        self,
        prompt: str,
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> GenerationResult:

        prompt = self._preprocess(
            prompt
        )

        result = self.generator.generate(
            prompt,
            config=(
                generation_config
                or self.config.generation_config
            ),
            **kwargs,
        )

        result.text = self._postprocess(
            result.text
        )

        if self.config.include_metadata:

            result.metadata[
                "pipeline"
            ] = "generation"

        return result

    # --------------------------------------------------
    # Batch execution
    # --------------------------------------------------

    def run_many(
        self,
        prompts: list[str],
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> list[GenerationResult]:

        prompts = validate_prompts(
            prompts
        )

        results = []

        for batch in batch_items(
            prompts,
            self.config.batch_size,
        ):

            batch_results = [
                self.run(
                    prompt,
                    generation_config=(
                        generation_config
                        or self.config.generation_config
                    ),
                    **kwargs,
                )
                for prompt in batch
            ]

            results.extend(
                batch_results
            )

        return results

    # --------------------------------------------------
    # Async batch execution
    # --------------------------------------------------

    async def run_async(
        self,
        prompt: str,
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> GenerationResult:

        prompt = self._preprocess(
            prompt
        )

        result = await self.generator.generate_async(
            prompt,
            config=(
                generation_config
                or self.config.generation_config
            ),
            **kwargs,
        )

        result.text = self._postprocess(
            result.text
        )

        if self.config.include_metadata:

            result.metadata[
                "pipeline"
            ] = "generation"

        return result

    async def run_many_async(
        self,
        prompts: list[str],
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> list[GenerationResult]:

        prompts = validate_prompts(
            prompts
        )

        semaphore = asyncio.Semaphore(
            self.config.concurrency
        )

        async def execute(
            prompt: str,
        ) -> GenerationResult:

            async with semaphore:

                return await self.run_async(
                    prompt,
                    generation_config=(
                        generation_config
                        or self.config.generation_config
                    ),
                    **kwargs,
                )

        return await asyncio.gather(
            *[
                execute(prompt)
                for prompt in prompts
            ]
        )

    # --------------------------------------------------
    # Streaming
    # --------------------------------------------------

    def stream(
        self,
        prompt: str,
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ):

        prompt = self._preprocess(
            prompt
        )

        for chunk in self.generator.stream(
            prompt,
            config=(
                generation_config
                or self.config.generation_config
            ),
            **kwargs,
        ):

            yield self._postprocess(
                chunk
            )

    async def stream_async(
        self,
        prompt: str,
        generation_config: GenerationConfig | None = None,
        **kwargs: Any,
    ):

        prompt = self._preprocess(
            prompt
        )

        async for chunk in (
            self.generator.stream_async(
                prompt,
                config=(
                    generation_config
                    or self.config.generation_config
                ),
                **kwargs,
            )
        ):

            yield self._postprocess(
                chunk
            )

    # --------------------------------------------------
    # Pipeline stages
    # --------------------------------------------------

    def add_preprocessor(
        self,
        function: Callable[[str], str],
    ) -> None:

        if not callable(function):

            raise TypeError(
                "Preprocessor must be callable"
            )

        self.preprocessors.append(
            function
        )

    def add_postprocessor(
        self,
        function: Callable[[str], str],
    ) -> None:

        if not callable(function):

            raise TypeError(
                "Postprocessor must be callable"
            )

        self.postprocessors.append(
            function
        )

    def _preprocess(
        self,
        prompt: str,
    ) -> str:

        prompt = str(prompt)

        if not self.config.preprocess_prompt:

            return prompt

        for processor in self.preprocessors:

            prompt = processor(
                prompt
            )

            if not isinstance(
                prompt,
                str,
            ):

                raise TypeError(
                    "Preprocessors must return strings"
                )

        return prompt

    def _postprocess(
        self,
        text: str,
    ) -> str:

        text = normalize_text(
            text
        )

        if not self.config.postprocess_output:

            return text

        for processor in self.postprocessors:

            text = processor(
                text
            )

            if not isinstance(
                text,
                str,
            ):

                raise TypeError(
                    "Postprocessors must return strings"
                )

        return text