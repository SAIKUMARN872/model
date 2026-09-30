import asyncio

from ai.providers.slm.phi import PhiProvider


async def main() -> None:
    provider = PhiProvider()

    await provider.initialize()

    health = await provider.health_check()
    models = await provider.list_models()
    metadata = provider.metadata

    print("INITIALIZED:", provider.initialized)
    print("HEALTHY:", health.healthy)
    print("STATUS:", health.status)
    print("MODEL COUNT:", len(models))

    for model in models:
        print(
            "MODEL:",
            model.id,
            "| TIER:",
            model.tier,
            "| CONTEXT:",
            model.context_window,
            "| QUALITY:",
            model.quality_score,
        )

    print("DISPLAY NAME:", metadata.display_name)
    print("STREAMING:", metadata.streaming_supported)
    print("TOOL USE:", metadata.tool_use_supported)
    print("ENTERPRISE READY:", metadata.enterprise_ready)

    await provider.close()

    print("INITIALIZED AFTER CLOSE:", provider.initialized)
    print("PHI SLM PROVIDER TEST: PASS")


asyncio.run(main())
