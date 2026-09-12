"""
Core generation engine for ModelNow.
"""

from __future__ import annotations

import asyncio
import inspect
import time
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Callable

from .encoder import PromptEncoder
from .utils import (
    estimate_tokens,
    estimate_tokens_batch,
    extract_text,
    merge_generation_kwargs,
    normalize_text,
    validate_prompt,
    validate_prompts,
)


class GenerationError(
    Exception
):
    """Base generation exception."""


class GenerationConfigurationError(
    GenerationError
):
    """Invalid generation configuration."""


@dataclass
class GenerationConfig:
    """
    Configuration for text generation.
    """

    max_new_tokens: int = 256

    temperature: float = 0.7

    top_p: float = 0.9

    top_k: int = 50

    repetition_penalty: float = 1.0

    do_sample: bool = True

    num_return_sequences: int = 1

    stop_sequences: list[str] = field(
        default_factory=list
    )

    return_full_text: bool = False

    timeout_seconds: float | None = None

    extra_kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.max_new_tokens <= 0:

            raise ValueError(
                "max_new_tokens must be positive"
            )

        if self.temperature < 0:

            raise ValueError(
                "temperature cannot be negative"
            )

        if not 0 < self.top_p <= 1:

            raise ValueError(
                "top_p must be between 0 and 1"
            )

        if self.top_k < 0:

            raise ValueError(
                "top_k cannot be negative"
            )

        if self.repetition_penalty <= 0:

            raise ValueError(
                "repetition_penalty must be positive"
            )

        if (
            self.num_return_sequences
            <= 0
        ):

            raise ValueError(
                "num_return_sequences must be positive"
            )

    def to_kwargs(self) -> dict[str, Any]:

        kwargs = {
            "max_new_tokens": (
                self.max_new_tokens
            ),
            "temperature": (
                self.temperature
            ),
            "top_p": self.top_p,
            "top_k": self.top_k,
            "repetition_penalty": (
                self.repetition_penalty
            ),
            "do_sample": self.do_sample,
            "num_return_sequences": (
                self.num_return_sequences
            ),
        }

        kwargs.update(
            self.extra_kwargs
        )

        return kwargs


@dataclass
class GenerationResult:
    """
    Result of a generation request.
    """

    prompt: str

    text: str

    model: str | None = None

    input_tokens: int = 0

    output_tokens: int = 0

    duration_ms: float = 0.0

    finish_reason: str = "stop"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def total_tokens(self) -> int:

        return (
            self.input_tokens
            + self.output_tokens
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "prompt": self.prompt,
            "text": self.text,
            "model": self.model,
            "input_tokens": (
                self.input_tokens
            ),
            "output_tokens": (
                self.output_tokens
            ),
            "total_tokens": (
                self.total_tokens
            ),
            "duration_ms": (
                self.duration_ms
            ),
            "finish_reason": (
                self.finish_reason
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class TextGenerator:
    """
    Provider-agnostic text generator.

    The supplied model can implement one of:

        generate(prompt, **kwargs)

    or be directly callable:

        model(prompt, **kwargs)
    """

    def __init__(
        self,
        model: Any,
        model_name: str | None = None,
        encoder: PromptEncoder | None = None,
        config: GenerationConfig | None = None,
    ) -> None:

        if model is None:

            raise GenerationConfigurationError(
                "model cannot be None"
            )

        self.model = model

        self.model_name = model_name

        self.encoder = (
            encoder
            or PromptEncoder()
        )

        self.config = (
            config
            or GenerationConfig()
        )

    # --------------------------------------------------
    # Core generation
    # --------------------------------------------------

    def generate(
        self,
        prompt: str,
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> GenerationResult:

        prompt = validate_prompt(
            prompt
        )

        generation_config = (
            config
            or self.config
        )

        generation_kwargs = (
            merge_generation_kwargs(
                generation_config.to_kwargs(),
                kwargs,
            )
        )

        started_at = time.perf_counter()

        try:

            response = self._call_model(
                prompt,
                generation_kwargs,
            )

            text = normalize_text(
                extract_text(response)
            )

        except Exception as exc:

            raise GenerationError(
                f"Generation failed: {exc}"
            ) from exc

        text = self._apply_stop_sequences(
            text,
            generation_config.stop_sequences,
        )

        duration_ms = (
            time.perf_counter()
            - started_at
        ) * 1000.0

        input_tokens = estimate_tokens(
            prompt
        )

        output_tokens = estimate_tokens(
            text
        )

        return GenerationResult(
            prompt=prompt,
            text=text,
            model=self.model_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            duration_ms=duration_ms,
            finish_reason="stop",
        )

    def generate_many(
        self,
        prompts: list[str],
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> list[GenerationResult]:

        prompts = validate_prompts(
            prompts
        )

        return [
            self.generate(
                prompt,
                config=config,
                **kwargs,
            )
            for prompt in prompts
        ]

    # --------------------------------------------------
    # Async generation
    # --------------------------------------------------

    async def generate_async(
        self,
        prompt: str,
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> GenerationResult:

        prompt = validate_prompt(
            prompt
        )

        generation_config = (
            config
            or self.config
        )

        generation_kwargs = (
            merge_generation_kwargs(
                generation_config.to_kwargs(),
                kwargs,
            )
        )

        started_at = time.perf_counter()

        try:

            if hasattr(
                self.model,
                "generate_async",
            ):

                response = (
                    self.model.generate_async(
                        prompt,
                        **generation_kwargs,
                    )
                )

                if inspect.isawaitable(
                    response
                ):

                    response = await response

            else:

                response = await asyncio.to_thread(
                    self._call_model,
                    prompt,
                    generation_kwargs,
                )

            text = normalize_text(
                extract_text(response)
            )

        except Exception as exc:

            raise GenerationError(
                f"Async generation failed: {exc}"
            ) from exc

        text = self._apply_stop_sequences(
            text,
            generation_config.stop_sequences,
        )

        duration_ms = (
            time.perf_counter()
            - started_at
        ) * 1000.0

        return GenerationResult(
            prompt=prompt,
            text=text,
            model=self.model_name,
            input_tokens=estimate_tokens(
                prompt
            ),
            output_tokens=estimate_tokens(
                text
            ),
            duration_ms=duration_ms,
        )

    async def generate_many_async(
        self,
        prompts: list[str],
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> list[GenerationResult]:

        prompts = validate_prompts(
            prompts
        )

        tasks = [
            self.generate_async(
                prompt,
                config=config,
                **kwargs,
            )
            for prompt in prompts
        ]

        return await asyncio.gather(
            *tasks
        )

    # --------------------------------------------------
    # Streaming
    # --------------------------------------------------

    def stream(
        self,
        prompt: str,
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ):
        """
        Stream generated chunks when the underlying model
        provides a streaming interface.

        Falls back to returning the complete result as
        a single chunk.
        """

        prompt = validate_prompt(
            prompt
        )

        generation_config = (
            config
            or self.config
        )

        generation_kwargs = (
            merge_generation_kwargs(
                generation_config.to_kwargs(),
                kwargs,
            )
        )

        if hasattr(
            self.model,
            "stream",
        ):

            try:

                for chunk in self.model.stream(
                    prompt,
                    **generation_kwargs,
                ):

                    yield normalize_text(
                        extract_text(chunk)
                    )

                return

            except Exception as exc:

                raise GenerationError(
                    f"Streaming failed: {exc}"
                ) from exc

        result = self.generate(
            prompt,
            config=generation_config,
            **kwargs,
        )

        yield result.text

    async def stream_async(
        self,
        prompt: str,
        config: GenerationConfig | None = None,
        **kwargs: Any,
    ) -> AsyncIterator[str]:

        prompt = validate_prompt(
            prompt
        )

        generation_config = (
            config
            or self.config
        )

        generation_kwargs = (
            merge_generation_kwargs(
                generation_config.to_kwargs(),
                kwargs,
            )
        )

        if hasattr(
            self.model,
            "stream_async",
        ):

            try:

                stream = (
                    self.model.stream_async(
                        prompt,
                        **generation_kwargs,
                    )
                )

                if hasattr(
                    stream,
                    "__aiter__",
                ):

                    async for chunk in stream:

                        yield normalize_text(
                            extract_text(chunk)
                        )

                    return

            except Exception as exc:

                raise GenerationError(
                    f"Async streaming failed: {exc}"
                ) from exc

        result = await self.generate_async(
            prompt,
            config=generation_config,
            **kwargs,
        )

        yield result.text

    # --------------------------------------------------
    # Model interaction
    # --------------------------------------------------

    def _call_model(
        self,
        prompt: str,
        kwargs: dict[str, Any],
    ) -> Any:

        if hasattr(
            self.model,
            "generate",
        ):

            return self.model.generate(
                prompt,
                **kwargs,
            )

        if callable(
            self.model
        ):

            return self.model(
                prompt,
                **kwargs,
            )

        raise GenerationError(
            "Model must implement "
            "'generate()' or be callable"
        )

    @staticmethod
    def _apply_stop_sequences(
        text: str,
        stop_sequences: list[str],
    ) -> str:

        if not stop_sequences:
            return text

        positions = []

        for sequence in stop_sequences:

            if not sequence:
                continue

            position = text.find(
                sequence
            )

            if position >= 0:

                positions.append(
                    position
                )

        if not positions:
            return text

        return text[
            :min(positions)
        ].rstrip()