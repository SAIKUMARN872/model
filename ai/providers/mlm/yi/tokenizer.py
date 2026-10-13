from __future__ import annotations

from typing import Any


class YiTokenizer:
    """Lazy wrapper around a Hugging Face tokenizer."""

    def __init__(self, model_id: str) -> None:
        self.model_id = model_id
        self._tokenizer: Any = None

    def load(self) -> Any:
        if self._tokenizer is None:
            try:
                from transformers import AutoTokenizer
            except ImportError as exc:
                raise RuntimeError(
                    "transformers is required for Yi tokenizer loading."
                ) from exc

            self._tokenizer = AutoTokenizer.from_pretrained(
                self.model_id
            )

        return self._tokenizer

    def encode(self, text: str) -> list[int]:
        tokenizer = self.load()
        return tokenizer.encode(text)

    def count(self, text: str) -> int:
        return len(self.encode(text))
