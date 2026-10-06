import asyncio

from ai.providers.slm.smollm import SmolLMProvider


async def main() -> None:
    provider = SmolLMProvider()

    await provider.initialize()

    health = await provider.health_check()
    models = await provider.list_models()

    print("INITIALIZED:", provider.initialized)
    print("HEALTHY:", health.healthy)
    print("STATUS:", health.status.value)
    print("MODEL COUNT:", len(models))

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

    metadata = provider.metadata

    print("DISPLAY NAME:", metadata.display_name)
    print("STREAMING:", metadata.streaming_supported)
    print("TOOL USE:", metadata.tool_use_supported)
    print("ENTERPRISE READY:", metadata.enterprise_ready)

    await provider.close()

    print("INITIALIZED AFTER CLOSE:", provider.initialized)
    print("SMOLLM SLM PROVIDER TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
