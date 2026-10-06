from __future__ import annotations

import asyncio
import threading
import time
from collections.abc import AsyncIterator
from typing import Any, Mapping

from ...base.client import BaseClient
from ...base.request import ChatRequest
from ...base.response import ChatResponse, ChatUsage, StreamChunk
from .config import QwenConfig
from .tokenizer import QwenTokenizer


class QwenClient(BaseClient):
    """Local Transformers client for Qwen models."""

    def __init__(self, config: QwenConfig) -> None:
        super().__init__(config)

        self.config = config
        self._model: Any = None
        self._tokenizer: QwenTokenizer | None = None
        self._torch: Any = None
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
        headers: Mapping[str, str] | None = None,
        json: Any = None,
        params: Mapping[str, str] | None = None,
    ) -> Any:
        raise NotImplementedError(
            "Qwen SLM uses local Transformers inference; "
            "HTTP requests are not supported."
        )

    async def load(
        self,
        model_id: str | None = None,
    ) -> None:
        if self.loaded:
            return

        selected_model = (
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
                "Qwen local inference requires "
                "'torch' and 'transformers'."
            ) from exc

        self._torch = torch

        tokenizer_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            tokenizer_kwargs["token"] = (
                self.config.huggingface_token
            )

        tokenizer = AutoTokenizer.from_pretrained(
            selected_model,
            **tokenizer_kwargs,
        )

        model_kwargs: dict[str, Any] = {}

        if self.config.huggingface_token:
            model_kwargs["token"] = (
                self.config.huggingface_token
            )

        if self.config.torch_dtype != "auto":
            dtype = getattr(
                torch,
                self.config.torch_dtype,
                None,
            )

            if dtype is None:
                raise ValueError(
                    f"Unsupported torch dtype: "
                    f"{self.config.torch_dtype}"
                )

            model_kwargs["torch_dtype"] = dtype

        if self.config.trust_remote_code:
            model_kwargs["trust_remote_code"] = True

        if self.config.device == "auto":
            model_kwargs["device_map"] = "auto"

        model = AutoModelForCausalLM.from_pretrained(
            selected_model,
            **model_kwargs,
        )

        if self.config.device != "auto":
            model = model.to(self.config.device)

        self._model = model
        self._tokenizer = QwenTokenizer(tokenizer)
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
            raise RuntimeError(
                "Qwen model is not loaded."
            )

        try:
            return self._model.device
        except AttributeError:
            return next(
                self._model.parameters()
            ).device

    def _prepare_inputs(
        self,
        request: ChatRequest,
    ) -> tuple[Any, Any | None]:
        if (
            self._model is None
            or self._tokenizer is None
        ):
            raise RuntimeError(
                "Qwen model failed to load."
            )

        messages = self._messages_to_dicts(request)

        inputs = self._tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        )

        if isinstance(inputs, Mapping):
            input_ids = inputs["input_ids"]
            attention_mask = inputs.get("attention_mask")

            input_ids = input_ids.to(
                self._input_device()
            )

            if attention_mask is not None:
                attention_mask = attention_mask.to(
                    self._input_device()
                )
        else:
            input_ids = inputs.to(
                self._input_device()
            )
            attention_mask = None

        return input_ids, attention_mask

    def _generation_kwargs(
        self,
        request: ChatRequest,
    ) -> dict[str, Any]:
        generation_kwargs: dict[str, Any] = {
            "max_new_tokens": (
                request.max_tokens
                or self.config.max_new_tokens
            )
        }

        if request.temperature is not None:
            if request.temperature <= 0:
                generation_kwargs["do_sample"] = False
            else:
                generation_kwargs["temperature"] = (
                    request.temperature
                )
                generation_kwargs["do_sample"] = True

        if request.top_p is not None:
            generation_kwargs["top_p"] = (
                request.top_p
            )

        if request.stop:
            if self._tokenizer is None:
                raise RuntimeError(
                    "Qwen tokenizer is not loaded."
                )

            tokenizer = self._tokenizer.tokenizer

            stop_token_ids: list[int] = []

            for stop_text in request.stop:
                encoded = tokenizer.encode(
                    stop_text,
                    add_special_tokens=False,
                )

                if encoded:
                    stop_token_ids.append(
                        encoded[-1]
                    )

            if stop_token_ids:
                generation_kwargs[
                    "eos_token_id"
                ] = stop_token_ids

        return generation_kwargs

    async def _generate(
        self,
        request: ChatRequest,
    ) -> tuple[str, int, int]:
        if not self.loaded:
            await self.load(request.model)

        if (
            self._model is None
            or self._tokenizer is None
        ):
            raise RuntimeError(
                "Qwen model failed to load."
            )

        input_ids, attention_mask = (
            self._prepare_inputs(request)
        )

        generate_kwargs = self._generation_kwargs(
            request
        )

        if attention_mask is not None:
            generate_kwargs[
                "attention_mask"
            ] = attention_mask

        with self._torch.no_grad():
            output_ids = self._model.generate(
                input_ids=input_ids,
                **generate_kwargs,
            )

        input_length = input_ids.shape[-1]

        generated_ids = (
            output_ids[0][input_length:]
        )

        content = self._tokenizer.decode(
            generated_ids.tolist(),
            skip_special_tokens=True,
        ).strip()

        input_tokens = int(input_length)
        output_tokens = int(generated_ids.shape[-1])

        return (
            content,
            input_tokens,
            output_tokens,
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if self._closed:
            raise RuntimeError(
                "Qwen client is closed."
            )

        started = time.perf_counter()

        (
            content,
            input_tokens,
            output_tokens,
        ) = await self._generate(request)

        latency_ms = (
            time.perf_counter() - started
        ) * 1000.0

        usage = ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=(
                input_tokens + output_tokens
            ),
            estimated_cost=0.0,
            metadata={
                "execution": "local",
                "tokenizer": "qwen",
            },
        )

        return ChatResponse(
            provider="qwen",
            model=request.model,
            content=content,
            usage=usage,
            latency_ms=latency_ms,
            time_to_first_token_ms=None,
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
        if self._closed:
            raise RuntimeError(
                "Qwen client is closed."
            )

        if not self.loaded:
            await self.load(request.model)

        if (
            self._model is None
            or self._tokenizer is None
            or self._torch is None
        ):
            raise RuntimeError(
                "Qwen model failed to load."
            )

        try:
            from transformers import TextIteratorStreamer
        except ImportError as exc:
            raise RuntimeError(
                "Qwen streaming requires "
                "'transformers'."
            ) from exc

        input_ids, attention_mask = (
            self._prepare_inputs(request)
        )

        input_tokens = int(
            input_ids.shape[-1]
        )

        generation_kwargs = (
            self._generation_kwargs(request)
        )

        if attention_mask is not None:
            generation_kwargs[
                "attention_mask"
            ] = attention_mask

        streamer = TextIteratorStreamer(
            self._tokenizer.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True,
            timeout=0.5,
        )

        generation_kwargs["streamer"] = streamer
        generation_kwargs["input_ids"] = input_ids

        started = time.perf_counter()
        first_token_ms: float | None = None
        output_tokens = 0
        accumulated: list[str] = []

        generation_error: list[BaseException] = []

        def generate() -> None:
            try:
                with self._torch.no_grad():
                    self._model.generate(
                        **generation_kwargs
                    )
            except BaseException as exc:
                generation_error.append(exc)

        thread = threading.Thread(
            target=generate,
            daemon=True,
        )

        thread.start()

        def read_stream_item() -> tuple[str, bool, bool]:
            try:
                return next(streamer), False, False
            except StopIteration:
                return "", True, False
            except Exception as exc:
                if exc.__class__.__name__ == "Empty":
                    return "", False, True
                raise

        while True:
            text, finished, timed_out = (
                await asyncio.to_thread(
                    read_stream_item
                )
            )

            if finished:
                break

            if timed_out:
                if generation_error:
                    raise generation_error[0]

                if not thread.is_alive():
                    break

                continue

            if not text:
                continue

            now = time.perf_counter()

            if first_token_ms is None:
                first_token_ms = (
                    now - started
                ) * 1000.0

            accumulated.append(text)

            output_tokens += len(
                self._tokenizer.encode(
                    text,
                    add_special_tokens=False,
                )
            )

            yield StreamChunk(
                content=text,
                provider="qwen",
                model=request.model,
                request_id=request.request_id,
                metadata={
                    "execution": "local",
                    "streaming_mode": "text_iterator",
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "time_to_first_token_ms": (
                        first_token_ms
                    ),
                },
                done=False,
            )

        await asyncio.to_thread(
            thread.join
        )

        if generation_error:
            raise generation_error[0]

        elapsed_ms = (
            time.perf_counter() - started
        ) * 1000.0

        content = "".join(accumulated)

        usage = ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=(
                input_tokens + output_tokens
            ),
            estimated_cost=0.0,
            metadata={
                "execution": "local",
                "tokenizer": "qwen",
                "streaming": True,
                "time_to_first_token_ms": (
                    first_token_ms
                ),
                "generation_latency_ms": (
                    elapsed_ms
                ),
            },
        )

        yield StreamChunk(
            content="",
            provider="qwen",
            model=request.model,
            request_id=request.request_id,
            finish_reason="stop",
            usage=usage,
            metadata={
                "execution": "local",
                "streaming_mode": "text_iterator",
                "time_to_first_token_ms": (
                    first_token_ms
                ),
                "generation_latency_ms": (
                    elapsed_ms
                ),
                "content_length": len(content),
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


__all__ = ["QwenClient"]
