import asyncio

from ai.providers.slm.tinyllama import TinyLlamaProvider


async def main() -> None:
    provider = TinyLlamaProvider()

    await provider.initialize()

    print("INITIALIZED:", provider.initialized)

    health = await provider.health_check()

    print("HEALTHY:", health.healthy)
    print("STATUS:", health.status.value)

    models = await provider.list_models()

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

    assert provider.initialized is True
    assert health.healthy is True
    assert health.status.value == "ready"

    assert len(models) == 1

    assert (
        models[0].id
        == "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )

    assert models[0].tier.value == "slm"
    assert models[0].context_window == 2048

    assert metadata.provider_id == "tinyllama"
    assert metadata.display_name == "TinyLlama"
    assert metadata.streaming_supported is True
    assert metadata.tool_use_supported is False
    assert metadata.enterprise_ready is True

    await provider.close()

    print(
        "INITIALIZED AFTER CLOSE:",
        provider.initialized,
    )

    assert provider.initialized is False

    print("TINYLLAMA SLM PROVIDER TEST: PASS")


asyncio.run(main())
