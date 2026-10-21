from __future__ import annotations

from typing import Any

from ...base.config import ProviderConfig
from ...base.request import ChatRequest
from ...base.response import ChatResponse
from .config import GemmaConfig
from .utils import messages_to_dicts, validate_model


class GemmaClient:
    """Lazy local Gemma client.

    Model loading happens only when real inference is requested.
    """

    def __init__(
        self,
        config: ProviderConfig,
        gemma_config: GemmaConfig,
    ) -> None:
        self.config = config
        self.gemma_config = gemma_config
        self._tokenizer: Any = None
        self._model: Any = None
        self._closed = False

    @property
    def closed(self) -> bool:
        return self._closed

    def _load(self) -> None:
        if self._model is not None:
            return

        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
        except ImportError as exc:
            raise RuntimeError(
                "transformers is required for real Gemma inference."
            ) from exc

        model_id = self.gemma_config.model_id

        self._tokenizer = AutoTokenizer.from_pretrained(model_id)

        kwargs: dict[str, Any] = {}

        if self.gemma_config.device != "auto":
            kwargs["device_map"] = self.gemma_config.device
        else:
            kwargs["device_map"] = "auto"

        self._model = AutoModelForCausalLM.from_pretrained(
            model_id,
            **kwargs,
        )

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if self._closed:
            raise RuntimeError("Gemma client is closed.")

        validate_model(
            request.model,
            (
                "google/gemma-3-4b-it",
                "google/gemma-3-12b-it",
                "gemma-3-4b-it",
                "gemma-3-12b-it",
            ),
        )

        self._load()

        messages = messages_to_dicts(request)

        prompt = self._tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self._tokenizer(
            prompt,
            return_tensors="pt",
        )

        inputs = {
            key: value.to(self._model.device)
            for key, value in inputs.items()
        }

        generation_kwargs: dict[str, Any] = {}

        if request.max_tokens is not None:
            generation_kwargs["max_new_tokens"] = request.max_tokens

        if request.temperature is not None:
            generation_kwargs["temperature"] = request.temperature

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        output = self._model.generate(
            **inputs,
            **generation_kwargs,
        )

        generated = output[0][inputs["input_ids"].shape[1]:]

        content = self._tokenizer.decode(
            generated,
            skip_special_tokens=True,
        )

        input_tokens = int(
            inputs["input_ids"].shape[1]
        )

        output_tokens = int(
            generated.shape[0]
        )

        return ChatResponse(
            provider="gemma",
            model=request.model,
            content=content,
            request_id=str(request.request_id),
            finish_reason="stop",
            metadata={
                "backend": "transformers",
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            },
        )

    async def close(self) -> None:
        self._model = None
        self._tokenizer = None
        self._closed = True
