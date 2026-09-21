from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from ...base.client import BaseClient
from ...base.request import ChatMessage, ChatRequest
from ...base.response import ChatResponse, StreamChunk
from .config import LlamaConfig
from .tokenizer import LlamaTokenizer


class LlamaClient(BaseClient):
    """Local Hugging Face Transformers client for Llama models."""

    def __init__(self, config: LlamaConfig) -> None:
        super().__init__(config)
        self.config = config
        self._model: Any = None
        self._tokenizer: LlamaTokenizer | None = None
        self._torch: Any = None
        self._loaded_model_id: str | None = None

    @property
    def loaded(self) -> bool:
        return self._model is not None and self._tokenizer is not None

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
            "LlamaClient is a local inference client and does not support HTTP requests."
        )

    def load(self, model_id: str | None = None) -> None:
        """Load a Llama model locally using Transformers."""
        if self.loaded and (
            model_id is None or model_id == self._loaded_model_id
        ):
            return

        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
        except ImportError as exc:
            raise RuntimeError(
                "Llama local inference requires 'torch' and 'transformers'."
            ) from exc

        selected_model = model_id or self.config.default_model

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

        if self.config.trust_remote_code:
            model_kwargs["trust_remote_code"] = True

        if self.config.device == "auto":
            model_kwargs["device_map"] = "auto"
        else:
            model_kwargs["device_map"] = self.config.device

        if self.config.torch_dtype != "auto":
            dtype = getattr(torch, self.config.torch_dtype, None)
            if dtype is None:
                raise ValueError(
                    f"Unsupported torch dtype: {self.config.torch_dtype}"
                )
            model_kwargs["torch_dtype"] = dtype

        model = AutoModelForCausalLM.from_pretrained(
            selected_model,
            **model_kwargs,
        )

        self._torch = torch
        self._model = model
        self._tokenizer = LlamaTokenizer(tokenizer)
        self._loaded_model_id = selected_model

    def _messages_to_dicts(
        self,
        messages: tuple[ChatMessage, ...],
    ) -> list[dict[str, str]]:
        return [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ]

    def _input_device(self) -> Any:
        if self._model is None:
            raise RuntimeError("Llama model has not been loaded.")

        try:
            return self._model.device
        except AttributeError:
            return next(self._model.parameters()).device

    def _generate(
        self,
        request: ChatRequest,
    ) -> tuple[str, int, int]:
        if not self.loaded:
            self.load(request.model)

        assert self._model is not None
        assert self._tokenizer is not None
        assert self._torch is not None

        messages = self._messages_to_dicts(request.messages)

        input_ids = self._tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        )

        if hasattr(input_ids, "to"):
            input_ids = input_ids.to(self._input_device())

        input_token_count = int(input_ids.shape[-1])

        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": request.max_tokens or self.config.max_new_tokens,
        }

        if request.temperature is not None:
            generation_kwargs["temperature"] = request.temperature

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        if request.stop:
            generation_kwargs["stop_strings"] = list(request.stop)

        with self._torch.no_grad():
            output_ids = self._model.generate(
                input_ids,
                **generation_kwargs,
            )

        generated_ids = output_ids[0][input_token_count:]

        content = self._tokenizer.decode(
            generated_ids.tolist(),
            skip_special_tokens=True,
        )

        output_token_count = len(generated_ids)

        return content.strip(), input_token_count, output_token_count

    async def chat(self, request: ChatRequest) -> ChatResponse:
        self.ensure_enabled()

        content, input_tokens, output_tokens = self._generate(request)

        from ...base.response import ChatUsage

        usage = ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            estimated_cost=0.0,
            metadata={
                "execution": "local",
                "provider": "llama",
            },
        )

        return ChatResponse(
            provider="llama",
            model=request.model,
            content=content,
            usage=usage,
            finish_reason="stop",
            request_id=request.request_id,
            metadata={
                "execution": "local",
                "model_id": request.model,
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
        )

    async def close(self) -> None:
        self._model = None
        self._tokenizer = None
        self._loaded_model_id = None

        if self._torch is not None and self._torch.cuda.is_available():
            self._torch.cuda.empty_cache()

        self._torch = None
        await super().close()


__all__ = ["LlamaClient"]
