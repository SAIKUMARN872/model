from __future__ import annotations

import time
from collections.abc import AsyncIterator
from typing import Any

from ...base.client import BaseClient
from ...base.request import ChatRequest
from ...base.response import ChatResponse, ChatUsage, StreamChunk
from .config import SmolLMConfig
from .tokenizer import SmolLMTokenizer


class SmolLMClient(BaseClient):
    """Local Transformers client for SmolLM models."""

    def __init__(self, config: SmolLMConfig) -> None:
        super().__init__(config)
        self.config = config
        self._model: Any | None = None
        self._tokenizer: SmolLMTokenizer | None = None
        self._loaded_model_id: str | None = None

    @property
    def loaded(self) -> bool:
        return self._model is not None and self._tokenizer is not None

    @property
    def model_id(self) -> str | None:
        return self._loaded_model_id

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: dict[str, str] | None = None,
        json: Any = None,
        params: dict[str, str] | None = None,
    ) -> Any:
        raise NotImplementedError(
            "SmolLM is a local model client and does not expose HTTP requests."
        )

    def load(self, model_id: str | None = None) -> None:
        if self.loaded:
            return

        model_id = model_id or self.config.default_model

        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
        except ImportError as exc:
            raise RuntimeError(
                "SmolLM requires 'torch' and 'transformers' to load a local model."
            ) from exc

        tokenizer_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            tokenizer_kwargs["token"] = self.config.huggingface_token

        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            **tokenizer_kwargs,
        )

        model_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            model_kwargs["token"] = self.config.huggingface_token

        if self.config.trust_remote_code:
            model_kwargs["trust_remote_code"] = True

        if self.config.device == "auto":
            model_kwargs["device_map"] = "auto"
        else:
            model_kwargs["device_map"] = self.config.device

        dtype = self._resolve_dtype(torch)

        if dtype is not None:
            model_kwargs["torch_dtype"] = dtype

        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            **model_kwargs,
        )

        if self.config.device != "auto":
            model.to(self.config.device)

        self._model = model
        self._tokenizer = SmolLMTokenizer(tokenizer)
        self._loaded_model_id = model_id

    def _resolve_dtype(self, torch: Any) -> Any | None:
        dtype = self.config.torch_dtype

        if dtype == "auto":
            return None

        mapping = {
            "float16": torch.float16,
            "fp16": torch.float16,
            "float32": torch.float32,
            "fp32": torch.float32,
            "bfloat16": torch.bfloat16,
            "bf16": torch.bfloat16,
        }

        return mapping.get(dtype.lower())

    def _generate(
        self,
        request: ChatRequest,
    ) -> tuple[str, int, int]:
        if not self.loaded:
            self.load(request.model or self.config.default_model)

        assert self._model is not None
        assert self._tokenizer is not None

        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        prompt = self._tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self._tokenizer._tokenizer(
            prompt,
            return_tensors="pt",
        )

        model_device = next(self._model.parameters()).device

        inputs = {
            key: value.to(model_device)
            for key, value in inputs.items()
        }

        input_tokens = int(inputs["input_ids"].shape[-1])

        max_new_tokens = (
            request.max_tokens
            if request.max_tokens is not None
            else self.config.max_new_tokens
        )

        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": max_new_tokens,
            "do_sample": request.temperature is not None
            and request.temperature > 0,
        }

        if request.temperature is not None:
            generation_kwargs["temperature"] = request.temperature

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        with self._model.device:
            pass

        outputs = self._model.generate(
            **inputs,
            **generation_kwargs,
        )

        generated_tokens = outputs[0][input_tokens:]

        output_text = self._tokenizer.decode(
            generated_tokens.tolist(),
            skip_special_tokens=True,
        ).strip()

        output_tokens = int(generated_tokens.shape[-1])

        return output_text, input_tokens, output_tokens

    async def chat(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()

        content, input_tokens, output_tokens = self._generate(
            request
        )

        latency_ms = (
            time.perf_counter() - started
        ) * 1000

        usage = ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            estimated_cost=0.0,
        )

        return ChatResponse(
            provider="smollm",
            model=request.model or self.config.default_model,
            content=content,
            usage=usage,
            latency_ms=latency_ms,
            finish_reason="stop",
            request_id=request.request_id,
            metadata={
                "execution": "local",
                "model_family": "SmolLM",
            },
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        response = await self.chat(request)

        yield StreamChunk(
            content=response.content,
            provider=response.provider,
            model=response.model,
            request_id=response.request_id,
            finish_reason=response.finish_reason,
            usage=response.usage,
            done=True,
            metadata=response.metadata,
        )

    async def close(self) -> None:
        self._model = None
        self._tokenizer = None
        self._loaded_model_id = None

        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except ImportError:
            pass

        await super().close()


__all__ = ["SmolLMClient"]
