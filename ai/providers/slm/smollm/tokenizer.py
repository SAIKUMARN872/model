from __future__ import annotations

from typing import Any


class SmolLMTokenizer:
    """Tokenizer adapter for local SmolLM models."""

    def __init__(self, tokenizer: Any | None = None) -> None:
        self._tokenizer = tokenizer

    @property
    def loaded(self) -> bool:
        return self._tokenizer is not None

    def encode(
        self,
        text: str,
        *,
        add_special_tokens: bool = True,
    ) -> list[int]:
        if self._tokenizer is None:
            raise RuntimeError("SmolLM tokenizer is not loaded.")

        return list(
            self._tokenizer.encode(
                text,
                add_special_tokens=add_special_tokens,
            )
        )

    def decode(
        self,
        token_ids: list[int],
        *,
        skip_special_tokens: bool = True,
    ) -> str:
        if self._tokenizer is None:
            raise RuntimeError("SmolLM tokenizer is not loaded.")

        return self._tokenizer.decode(
            token_ids,
            skip_special_tokens=skip_special_tokens,
        )

    def count_tokens(self, text: str) -> int:
        return len(self.encode(text))

    def apply_chat_template(
        self,
        messages: list[dict[str, str]],
        *,
        tokenize: bool = False,
        add_generation_prompt: bool = True,
    ) -> Any:
        if self._tokenizer is None:
            raise RuntimeError("SmolLM tokenizer is not loaded.")

        return self._tokenizer.apply_chat_template(
            messages,
            tokenize=tokenize,
            add_generation_prompt=add_generation_prompt,
        )


__all__ = ["SmolLMTokenizer"]
