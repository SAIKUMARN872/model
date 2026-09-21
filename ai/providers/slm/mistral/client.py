from __future__ import annotations

import time
from collections.abc import AsyncIterator
from typing import Any, Mapping

from ...base.client import BaseClient
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk
from .config import MistralConfig
from .tokenizer import MistralTokenizer


class MistralClient(BaseClient):
    """Local Transformers client for Mistral models."""

    def __init__(self, config: MistralConfig) -> None:
        super().__init__(config)

        self.config = config
        self._model: Any = None
        self._tokenizer: MistralTokenizer | None = None
        self._torch: Any = None
        self._model_id: str | None = None

    @property
    def loaded(self) -> bool:
        return self._model is not None and self._tokenizer is not None

    @property
    def model_id(self) -> str | None:
        return self._model_id

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: Mapping[str, str] | None = None,
        json: Any = None,
        params: Mapping[str, str] | None = None,
    ) -> Any:
        raise NotImplementedError(
            "Mistral SLM uses local Transformers inference; "
            "HTTP requests are not supported."
        )

    async def load(self, model_id: str | None = None) -> None:
        """Load a Mistral model into local memory."""
        if self.loaded:
            return

        selected_model = model_id or self.config.default_model

        try:
            import torch
            from transformers import (
                AutoModelForCausalLM,
                AutoTokenizer,
            )
        except ImportError as exc:
            raise RuntimeError(
                "Mistral local inference requires "
                "'torch' and 'transformers'."
            ) from exc

        self._torch = torch

        tokenizer_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            tokenizer_kwargs["token"] = self.config.huggingface_token

        tokenizer = AutoTokenizer.from_pretrained(
            selected_model,
            **tokenizer_kwargs,
        )

        model_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            model_kwargs["token"] = self.config.huggingface_token

        if self.config.torch_dtype != "auto":
            dtype = getattr(torch, self.config.torch_dtype, None)

            if dtype is None:
                raise ValueError(
                    f"Unsupported torch dtype: "
                    f"{self.config.torch_dtype}"
                )

            model_kwargs["torch_dtype"] = dtype

        if self.config.device == "auto":
            model_kwargs["device_map"] = "auto"

        model = AutoModelForCausalLM.from_pretrained(
            selected_model,
            **model_kwargs,
        )

        if self.config.device != "auto":
            model = model.to(self.config.device)

        self._model = model
        self._tokenizer = MistralTokenizer(tokenizer)
        self._model_id = selected_model

    def _messages_to_dicts(
        self,
        request: ChatRequest,
    ) -> list[dict[str, str]]:
        return [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

    def _input_device(self) -> Any:
        if self._model is None:
            raise RuntimeError("Mistral model is not loaded.")

        try:
            return self._model.device
        except AttributeError:
            return next(self._model.parameters()).device

    async def _generate(self, request: ChatRequest) -> str:
        if not self.loaded:
            await self.load(request.model)

        if self._model is None or self._tokenizer is None:
            raise RuntimeError("Mistral model failed to load.")

        messages = self._messages_to_dicts(request)

        inputs = self._tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        )

        if hasattr(inputs, "to"):
            inputs = inputs.to(self._input_device())

        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": (
                request.max_tokens
                or self.config.max_new_tokens
            ),
        }

        if request.temperature is not None:
            generation_kwargs["temperature"] = request.temperature

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        if request.stop:
            tokenizer = self._tokenizer.tokenizer

            stop_token_ids: list[int] = []

            for stop_text in request.stop:
                encoded = tokenizer.encode(
                    stop_text,
                    add_special_tokens=False,
                )

                if encoded:
                    stop_token_ids.append(encoded[-1])

            if stop_token_ids:
                generation_kwargs["eos_token_id"] = stop_token_ids

        with self._torch.no_grad():
            output_ids = self._model.generate(
                inputs,
                **generation_kwargs,
            )

        input_length = (
            inputs.shape[-1]
            if hasattr(inputs, "shape")
            else 0
        )

        generated_ids = output_ids[0][input_length:]

        return self._tokenizer.decode(
            generated_ids.tolist(),
            skip_special_tokens=True,
        ).strip()

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if self._closed:
            raise RuntimeError("Mistral client is closed.")

        started = time.perf_counter()

        content = await self._generate(request)

        latency_ms = (
            time.perf_counter() - started
        ) * 1000.0

        return ChatResponse(
            provider="mistral",
            model=request.model,
            content=content,
            latency_ms=latency_ms,
            time_to_first_token_ms=latency_ms,
            finish_reason="stop",
            request_id=request.request_id,
            metadata={
                "execution": "local",
                "model_loaded": True,
                "cost": 0.0,
            },
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        """Return the completed local generation as one stream chunk."""
        response = await self.chat(request)

        yield StreamChunk(
            content=response.content,
            provider=response.provider,
            model=response.model,
            request_id=response.request_id,
            finish_reason=response.finish_reason,
            usage=response.usage,
            metadata={
                "execution": "local",
                "streaming_mode": "single_final_chunk",
            },
            done=True,
        )

    async def close(self) -> None:
        self._model = None
        self._tokenizer = None
        self._model_id = None

        if self._torch is not None:
            try:
                if self._torch.cuda.is_available():
                    self._torch.cuda.empty_cache()
            except Exception:
                pass

        self._torch = None
        await super().close()


__all__ = ["MistralClient"]
