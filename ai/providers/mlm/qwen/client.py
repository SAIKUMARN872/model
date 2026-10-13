from __future__ import annotations

from typing import Any

from ...base.config import ProviderConfig
from ...base.request import ChatRequest
from ...base.response import ChatResponse

from .config import QwenConfig
from .utils import messages_to_dicts, validate_model


class QwenClient:
    """Lazy local Qwen client using Hugging Face Transformers."""

    def __init__(
        self,
        config: ProviderConfig,
        qwen_config: QwenConfig,
    ) -> None:
        self.config = config
        self.qwen_config = qwen_config
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
                "transformers is required for real Qwen inference."
            ) from exc

        model_id = self.qwen_config.model_id

        self._tokenizer = AutoTokenizer.from_pretrained(model_id)

        kwargs: dict[str, Any] = {
            "device_map": "auto",
        }

        if self.qwen_config.device != "auto":
            kwargs["device_map"] = self.qwen_config.device

        self._model = AutoModelForCausalLM.from_pretrained(
            model_id,
            **kwargs,
        )

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if self._closed:
            raise RuntimeError("Qwen client is closed.")

        validate_model(
            request.model,
            (
                "Qwen/Qwen3-8B",
                "Qwen/Qwen3-14B",
                "Qwen3-8B",
                "Qwen3-14B",
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
            provider="qwen",
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
