"""
Prompt/input encoder for ModelNow generation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol

from .utils import (
    estimate_tokens,
    validate_prompt,
    validate_prompts,
)


class EncoderProtocol(Protocol):
    """Protocol for custom encoders."""

    def encode(
        self,
        prompt: str,
    ) -> Any:
        ...


@dataclass
class EncodedPrompt:
    """Represents an encoded generation input."""

    original: str

    encoded: Any

    estimated_tokens: int

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "original": self.original,
            "encoded": self.encoded,
            "estimated_tokens": (
                self.estimated_tokens
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class PromptEncoder:
    """
    Generic prompt encoder.

    By default it returns strings unchanged.

    A tokenizer can be supplied to convert prompts
    into token IDs.
    """

    def __init__(
        self,
        tokenizer: Any = None,
        max_length: int | None = None,
        truncation: bool = True,
        padding: bool = False,
    ) -> None:

        self.tokenizer = tokenizer

        self.max_length = max_length

        self.truncation = truncation

        self.padding = padding

        if (
            max_length is not None
            and max_length <= 0
        ):

            raise ValueError(
                "max_length must be positive"
            )

    def encode(
        self,
        prompt: str,
    ) -> Any:

        prompt = validate_prompt(
            prompt
        )

        if self.tokenizer is None:
            return prompt

        kwargs: dict[str, Any] = {
            "return_tensors": "pt",
            "truncation": self.truncation,
            "padding": self.padding,
        }

        if self.max_length is not None:

            kwargs[
                "max_length"
            ] = self.max_length

        try:

            return self.tokenizer(
                prompt,
                **kwargs,
            )

        except Exception as exc:

            raise RuntimeError(
                f"Prompt encoding failed: {exc}"
            ) from exc

    def encode_many(
        self,
        prompts: list[str],
    ) -> list[Any]:

        prompts = validate_prompts(
            prompts
        )

        if self.tokenizer is None:
            return prompts

        kwargs: dict[str, Any] = {
            "return_tensors": "pt",
            "truncation": self.truncation,
            "padding": self.padding,
        }

        if self.max_length is not None:

            kwargs[
                "max_length"
            ] = self.max_length

        try:

            encoded = self.tokenizer(
                prompts,
                **kwargs,
            )

            return encoded

        except Exception as exc:

            raise RuntimeError(
                f"Batch prompt encoding failed: {exc}"
            ) from exc

    def encode_with_metadata(
        self,
        prompt: str,
    ) -> EncodedPrompt:

        prompt = validate_prompt(
            prompt
        )

        encoded = self.encode(
            prompt
        )

        return EncodedPrompt(
            original=prompt,
            encoded=encoded,
            estimated_tokens=(
                estimate_tokens(prompt)
            ),
        )

    def encode_many_with_metadata(
        self,
        prompts: list[str],
    ) -> list[EncodedPrompt]:

        return [
            self.encode_with_metadata(
                prompt
            )
            for prompt in prompts
        ]

    def decode(
        self,
        tokens: Any,
        skip_special_tokens: bool = True,
    ) -> str:

        if self.tokenizer is None:

            if isinstance(
                tokens,
                str,
            ):
                return tokens

            return str(tokens)

        try:

            return self.tokenizer.decode(
                tokens,
                skip_special_tokens=(
                    skip_special_tokens
                ),
            )

        except Exception as exc:

            raise RuntimeError(
                f"Token decoding failed: {exc}"
            ) from exc

    def decode_many(
        self,
        tokens: Any,
        skip_special_tokens: bool = True,
    ) -> list[str]:

        if self.tokenizer is None:

            if isinstance(
                tokens,
                list,
            ):
                return [
                    str(item)
                    for item in tokens
                ]

            return [str(tokens)]

        try:

            return self.tokenizer.batch_decode(
                tokens,
                skip_special_tokens=(
                    skip_special_tokens
                ),
            )

        except Exception as exc:

            raise RuntimeError(
                f"Batch token decoding failed: {exc}"
            ) from exc