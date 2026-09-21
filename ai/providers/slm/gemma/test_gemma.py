import asyncio

from ai.providers.slm.gemma import (
    GEMMA_MODELS,
    GemmaConfig,
    GemmaProvider,
)


async def main() -> None:
    provider = GemmaProvider(
        GemmaConfig()
    )

    print(
        "PROVIDER:",
        provider.__class__.__name__,
    )

    await provider.initialize()

    print(
        "INITIALIZED:",
        provider._initialized,
    )

    print(
        "STATUS:",
        provider._status.value,
    )

    health = await provider.health_check()

    print(
        "HEALTHY:",
        health.healthy,
    )

    print(
        "HEALTH STATUS:",
        health.status.value,
    )

    print(
        "MESSAGE:",
        health.message,
    )

    models = await provider.list_models()

    print(
        "MODEL COUNT:",
        len(models),
    )

    for model in models:
        print(
            "MODEL:",
            model.id,
            "| TIER:",
            model.tier.value,
            "| CONTEXT:",
            model.context_window,
            "| QUALITY:",
            model.quality_score,
        )

    print(
        "SUPPORTS gemma-3-1b-it:",
        await provider.supports_model(
            "gemma-3-1b-it"
        ),
    )

    print(
        "SUPPORTS unknown-model:",
        await provider.supports_model(
            "unknown-model"
        ),
    )

    metadata = provider.metadata()

    print(
        "DISPLAY NAME:",
        metadata.display_name,
    )

    print(
        "STREAMING:",
        metadata.streaming_supported,
    )

    print(
        "TOOL USE:",
        metadata.tool_use_supported,
    )

    print(
        "ENTERPRISE READY:",
        metadata.enterprise_ready,
    )

    await provider.close()

    print(
        "INITIALIZED AFTER CLOSE:",
        provider._initialized,
    )

    print(
        "GEMMA SLM PROVIDER TEST: PASS"
    )


if __name__ == "__main__":
    asyncio.run(main())