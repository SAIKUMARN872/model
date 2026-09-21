from __future__ import annotations

from typing import Any, AsyncIterator

from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk

from .config import GemmaConfig
from .tokenizer import GemmaTokenizer


class GemmaClient:
    """Local Hugging Face Transformers client for Gemma."""

    def __init__(self, config: GemmaConfig) -> None:
        self.config = config
        self._model: Any = None
        self._tokenizer: GemmaTokenizer | None = None
        self._model_id: str | None = None

    @property
    def loaded(self) -> bool:
        return self._model is not None

    async def load(
        self,
        model_id: str | None = None,
    ) -> None:
        if self._model is not None:
            if model_id is None or model_id == self._model_id:
                return

            await self.close()

        model_id = (
            model_id
            or self.config.default_model
        )

        import torch
        from transformers import AutoModelForCausalLM

        kwargs: dict[str, Any] = {
            "trust_remote_code": (
                self.config.trust_remote_code
            ),
        }

        if self.config.huggingface_token:
            kwargs["token"] = (
                self.config.huggingface_token
            )

        if self.config.torch_dtype == "auto":
            kwargs["torch_dtype"] = (
                torch.bfloat16
                if torch.cuda.is_available()
                else torch.float32
            )

        elif self.config.torch_dtype == "float16":
            kwargs["torch_dtype"] = torch.float16

        elif self.config.torch_dtype == "bfloat16":
            kwargs["torch_dtype"] = torch.bfloat16

        elif self.config.torch_dtype == "float32":
            kwargs["torch_dtype"] = torch.float32

        if self.config.device == "auto":
            kwargs["device_map"] = "auto"

        self._model = (
            AutoModelForCausalLM.from_pretrained(
                model_id,
                **kwargs,
            )
        )

        self._tokenizer = GemmaTokenizer(
            model_id=model_id,
            token=self.config.huggingface_token,
            trust_remote_code=(
                self.config.trust_remote_code
            ),
        )

        self._model_id = model_id

        if self.config.device != "auto":
            self._model = self._model.to(
                self.config.device
            )

        self._model.eval()

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        await self.load(request.model)

        assert self._model is not None
        assert self._tokenizer is not None

        messages = []

        for message in request.messages:
            content = message.content

            if not isinstance(content, str):
                content = str(content)

            messages.append(
                {
                    "role": message.role,
                    "content": content,
                }
            )

        inputs = (
            self._tokenizer.apply_chat_template(
                messages
            )
        )

        device = self._model.device
        inputs = inputs.to(device)

        import torch

        max_new_tokens = (
            request.max_tokens
            or self.config.max_new_tokens
        )

        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": max_new_tokens,
            "do_sample": bool(
                request.temperature is not None
                and request.temperature > 0
            ),
        }

        if (
            request.temperature is not None
            and request.temperature > 0
        ):
            generation_kwargs["temperature"] = (
                request.temperature
            )

        if request.top_p is not None:
            generation_kwargs["top_p"] = request.top_p

        with torch.no_grad():
            outputs = self._model.generate(
                inputs,
                **generation_kwargs,
            )

        generated = outputs[0][inputs.shape[-1]:]

        content = self._tokenizer.decode(
            generated
        )

        input_tokens = int(inputs.shape[-1])
        output_tokens = int(generated.shape[-1])

        return ChatResponse(
            provider="gemma",
            model=request.model,
            content=content,
            usage={
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": (
                    input_tokens + output_tokens
                ),
            },
            finish_reason="stop",
            request_id=str(request.request_id),
            metadata={
                "execution": "local",
                "device": str(device),
            },
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        response = await self.chat(request)

        yield StreamChunk(
            provider=response.provider,
            model=response.model,
            request_id=response.request_id,
            content=response.content,
            usage=response.usage,
            finish_reason=response.finish_reason,
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

        except Exception:
            pass