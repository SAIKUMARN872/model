import asyncio

from ai.providers.llm.deepseek.provider import DeepSeekProvider


async def main():
    provider = DeepSeekProvider()

    print("PROVIDER:", provider.name)
    print("INITIALIZED:", provider.initialized)

    metadata = provider.metadata

    print(
        "METADATA:",
        metadata.provider_id,
        metadata.display_name,
    )

    models = await provider.list_models()

    print(
        "MODELS:",
        [
            (
                model.id,
                model.provider,
                model.tier.value,
                model.context_window,
                model.max_output_tokens,
            )
            for model in models
        ],
    )

    health = await provider.health_check()

    print(
        "HEALTH:",
        health.status.value,
        health.message,
    )


if __name__ == "__main__":
    asyncio.run(main())
