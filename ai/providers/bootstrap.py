from __future__ import annotations

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import ModelRecord
from ai.model_registry.utils import model_info_to_record
from ai.providers.base.config import ProviderConfig
from ai.providers.llm.anthropic import AnthropicProvider
from ai.providers.llm.anthropic.config import AnthropicConfig
from ai.providers.llm.openai import OpenAIProvider
from ai.providers.mlm.deepseek import DeepSeekProvider
from ai.providers.mlm.mistral import MistralProvider
from ai.providers.slm.qwen import QwenProvider
from ai.providers.slm.smollm import SmolLMProvider


class CanonicalProviderBootstrap:
    """Populate the canonical ModelNow model registry from providers."""

    def __init__(self, registry: ModelRegistryEngine) -> None:
        self.registry = registry

    @staticmethod
    def providers() -> list[object]:
        return [
            QwenProvider(),
            SmolLMProvider(),
            DeepSeekProvider(),
            MistralProvider(),
            OpenAIProvider(
                ProviderConfig(provider_id="openai")
            ),
            AnthropicProvider(AnthropicConfig()),
        ]

    async def load(self) -> list[ModelRecord]:
        registered: list[ModelRecord] = []

        for provider in self.providers():
            model_infos = await provider.list_models()

            for model_info in model_infos:
                record = model_info_to_record(model_info)

                existing = self.registry.get(
                    record.provider,
                    record.model_id,
                )

                if existing is not None:
                    registered.append(existing)
                    continue

                registered.append(
                    self.registry.register(record)
                )

        return registered


__all__ = ["CanonicalProviderBootstrap"]
