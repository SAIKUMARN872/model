from __future__ import annotations

import asyncio

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.slm.smollm.config import SmolLMConfig
from ai.providers.slm.smollm.provider import SmolLMProvider


async def main() -> None:
    config = SmolLMConfig.from_env()
    provider = SmolLMProvider(config)

    try:
        await provider.initialize()
        print("SMOLLM PROVIDER: INITIALIZED")
        print(f"DEFAULT MODEL: {config.default_model}")

        models = await provider.list_models()
        print(f"MODEL COUNT: {len(models)}")

        for model in models:
            print(
                f"MODEL: {model.id} | "
                f"TIER: {model.tier.value} | "
                f"CONTEXT: {model.context_window} | "
                f"QUALITY: {model.quality_score}"
            )

        if not models:
            raise RuntimeError("SmolLM returned no models.")

        model_ids = {model.id for model in models}
        if config.default_model not in model_ids:
            raise RuntimeError(
                "SmolLM default model is not present in the model catalog."
            )

        print("MODEL CATALOG: PASS")

        print("===== SMOLLM CHAT TEST =====")
        request = ChatRequest(
            model=config.default_model,
            messages=[
                ChatMessage(
                    role="user",
                    content="Explain artificial intelligence in one short sentence.",
                )
            ],
            max_tokens=64,
            temperature=0.2,
            stream=False,
        )

        result = await provider.chat(request)

        if not result.content:
            raise RuntimeError("SmolLM returned empty content.")

        print("CHAT RESULT: PASS")
        print(f"PROVIDER: {result.provider}")
        print(f"MODEL: {result.model}")
        print(f"CONTENT: {result.content}")
        print(f"INPUT TOKENS: {result.usage.input_tokens}")
        print(f"OUTPUT TOKENS: {result.usage.output_tokens}")
        print(f"TOTAL TOKENS: {result.usage.total_tokens}")
        print(f"LATENCY MS: {result.latency_ms}")

        if result.usage.total_tokens <= 0:
            raise RuntimeError("SmolLM returned invalid token usage.")

        if result.latency_ms is None or result.latency_ms <= 0:
            raise RuntimeError("SmolLM did not return valid latency.")

        print("CONTENT: PASS")
        print("USAGE: PASS")
        print("LATENCY: PASS")
        print("SMOLLM PROVIDER TEST: PASS")

    finally:
        await provider.close()
        print("SMOLLM PROVIDER: CLOSED")


if __name__ == "__main__":
    asyncio.run(main())
