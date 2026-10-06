import asyncio

from ai.providers.slm.qwen import QwenProvider


async def main() -> None:
    provider = QwenProvider()

    await provider.initialize()

    health = await provider.health_check()
    models = await provider.list_models()
    metadata = provider.metadata

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

    print("DISPLAY NAME:", metadata.display_name)
    print("STREAMING:", metadata.streaming_supported)
    print("TOOL USE:", metadata.tool_use_supported)
    print("ENTERPRISE READY:", metadata.enterprise_ready)

    await provider.close()

    print("INITIALIZED AFTER CLOSE:", provider.initialized)

    assert provider.initialized is False
    assert health.healthy is True
    assert len(models) == 2
    assert metadata.provider_id == "qwen"
    assert metadata.enterprise_ready is True

    print("QWEN SLM PROVIDER TEST: PASS")


asyncio.run(main())
