from __future__ import annotations

from typing import Any


class TinyLlamaTokenizer:
    def __init__(self, tokenizer: Any | None = None) -> None:
        self._tokenizer = tokenizer

    @property
    def loaded(self) -> bool:
        return self._tokenizer is not None

    def encode(self, text: str, **kwargs: Any) -> list[int]:
        if self._tokenizer is None:
            raise RuntimeError("TinyLlama tokenizer is not loaded.")

        result = self._tokenizer.encode(text, **kwargs)
        return list(result)

    def decode(self, token_ids: list[int], **kwargs: Any) -> str:
        if self._tokenizer is None:
            raise RuntimeError("TinyLlama tokenizer is not loaded.")

        return str(
            self._tokenizer.decode(
                token_ids,
                **kwargs,
            )
        )

    def count_tokens(self, text: str) -> int:
        return len(self.encode(text))

    def apply_chat_template(
        self,
        messages: list[dict[str, Any]],
        **kwargs: Any,
    ) -> Any:
        if self._tokenizer is None:
            raise RuntimeError("TinyLlama tokenizer is not loaded.")

        return self._tokenizer.apply_chat_template(
            messages,
            **kwargs,
        )


__all__ = ["TinyLlamaTokenizer"]
