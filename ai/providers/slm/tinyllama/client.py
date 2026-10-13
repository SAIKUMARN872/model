from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from ...base.client import BaseClient
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk
from .config import TinyLlamaConfig
from .tokenizer import TinyLlamaTokenizer
from .utils import normalize_model_id


class TinyLlamaClient(BaseClient):
    def __init__(
        self,
        config: TinyLlamaConfig | None = None,
    ) -> None:
        self.config = config or TinyLlamaConfig.from_env()

        super().__init__(self.config)

        self._model: Any | None = None
        self._tokenizer: Any | None = None
        self._model_id: str | None = None

    @property
    def loaded(self) -> bool:
        return (
            self._model is not None
            and self._tokenizer is not None
        )

    @property
    def model_id(self) -> str | None:
        return self._model_id

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
            "TinyLlama is a local Transformers provider and does not use HTTP requests."
        )

    def _resolve_dtype(
        self,
        torch: Any,
    ) -> Any:
        dtype = self.config.torch_dtype

        if dtype == "auto":
            return "auto"

        mapping = {
            "float16": torch.float16,
            "fp16": torch.float16,
            "float32": torch.float32,
            "fp32": torch.float32,
            "bfloat16": torch.bfloat16,
            "bf16": torch.bfloat16,
        }

        return mapping.get(
            dtype.lower(),
            "auto",
        )

    def load(
        self,
        model_id: str | None = None,
    ) -> None:
        if self.loaded:
            return

        model_id = normalize_model_id(
            model_id or self.config.default_model
        )

        try:
            import torch
            from transformers import (
                AutoModelForCausalLM,
                AutoTokenizer,
            )
        except ImportError as exc:
            raise RuntimeError(
                "TinyLlama requires torch and transformers."
            ) from exc

        tokenizer_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            tokenizer_kwargs["token"] = (
                self.config.huggingface_token
            )

        self._tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            **tokenizer_kwargs,
        )

        model_kwargs: dict[str, Any] = {
            "device_map": "auto",
        }

        dtype = self._resolve_dtype(torch)

        if dtype != "auto":
            model_kwargs["torch_dtype"] = dtype

        if self.config.huggingface_token:
            model_kwargs["token"] = (
                self.config.huggingface_token
            )

        self._model = AutoModelForCausalLM.from_pretrained(
            model_id,
            **model_kwargs,
        )

        self._model_id = model_id

    def _generate(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if not self.loaded:
            self.load(request.model)

        assert self._model is not None
        assert self._tokenizer is not None

        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        tokenizer = TinyLlamaTokenizer(
            self._tokenizer
        )

        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self._tokenizer(
            prompt,
            return_tensors="pt",
        )

        try:
            device = self._model.device
            inputs = {
                key: value.to(device)
                for key, value in inputs.items()
            }
        except Exception:
            pass

        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": (
                request.max_tokens
                or self.config.max_new_tokens
            ),
        }

        if request.temperature is not None:
            generation_kwargs["temperature"] = (
                request.temperature
            )
            generation_kwargs["do_sample"] = (
                request.temperature > 0
            )

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        output = self._model.generate(
            **inputs,
            **generation_kwargs,
        )

        input_length = inputs["input_ids"].shape[-1]

        generated_ids = output[
            0,
            input_length:,
        ]

        content = self._tokenizer.decode(
            generated_ids,
            skip_special_tokens=True,
        )

        usage = {
            "input_tokens": input_length,
            "output_tokens": len(generated_ids),
        }

        return ChatResponse(
            provider="tinyllama",
            model=self._model_id or request.model,
            content=content,
            metadata={
                "local": True,
                "backend": "transformers",
                "usage": usage,
            },
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        return self._generate(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        response = await self.chat(request)

        yield StreamChunk(
            provider=response.provider,
            model=response.model,
            content=response.content,
            request_id=response.request_id,
            finish_reason=response.finish_reason,
            usage=response.usage,
            metadata=response.metadata,
            done=True,
        )

    async def close(self) -> None:
        self._model = None
        self._tokenizer = None
        self._model_id = None

        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except ImportError:
            pass

        await super().close()


__all__ = ["TinyLlamaClient"]
