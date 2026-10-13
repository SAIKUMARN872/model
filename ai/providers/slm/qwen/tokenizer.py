from __future__ import annotations

from typing import Any


class QwenTokenizer:
    """Tokenizer adapter for local Qwen models."""

    def __init__(self, tokenizer: Any) -> None:
        self._tokenizer = tokenizer

    @property
    def tokenizer(self) -> Any:
        return self._tokenizer

    def encode(self, text: str, **kwargs: Any) -> list[int]:
        return self._tokenizer.encode(text, **kwargs)

    def decode(
        self,
        token_ids: list[int],
        **kwargs: Any,
    ) -> str:
        return self._tokenizer.decode(
            token_ids,
            **kwargs,
        )

    def count_tokens(self, text: str) -> int:
        return len(self.encode(text))

    def apply_chat_template(
        self,
        messages: list[dict[str, str]],
        *,
        tokenize: bool = False,
        add_generation_prompt: bool = True,
        **kwargs: Any,
    ) -> Any:
        return self._tokenizer.apply_chat_template(
            messages,
            tokenize=tokenize,
            add_generation_prompt=add_generation_prompt,
            **kwargs,
        )


__all__ = ["QwenTokenizer"]
