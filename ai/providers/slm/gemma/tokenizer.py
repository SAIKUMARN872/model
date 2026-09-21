from __future__ import annotations

from typing import Any


class GemmaTokenizer:
    """Lazy Hugging Face tokenizer wrapper for Gemma."""

    def __init__(
        self,
        model_id: str,
        token: str | None = None,
        trust_remote_code: bool = False,
    ) -> None:
        self.model_id = model_id
        self.token = token
        self.trust_remote_code = trust_remote_code
        self._tokenizer: Any = None

    def load(self) -> Any:
        if self._tokenizer is not None:
            return self._tokenizer

        from transformers import AutoTokenizer

        self._tokenizer = AutoTokenizer.from_pretrained(
            self.model_id,
            token=self.token,
            trust_remote_code=self.trust_remote_code,
        )

        return self._tokenizer

    def encode(self, text: str, **kwargs: Any) -> Any:
        tokenizer = self.load()
        return tokenizer(
            text,
            return_tensors="pt",
            **kwargs,
        )

    def decode(self, tokens: Any, **kwargs: Any) -> str:
        tokenizer = self.load()

        return tokenizer.decode(
            tokens,
            skip_special_tokens=True,
            **kwargs,
        )

    def apply_chat_template(
        self,
        messages: list[dict[str, Any]],
        **kwargs: Any,
    ) -> Any:
        tokenizer = self.load()

        return tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
            **kwargs,
        )

    @property
    def tokenizer(self) -> Any:
        return self.load()