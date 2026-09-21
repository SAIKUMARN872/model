import asyncio
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[4]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ai.providers.slm.mistral.provider import MistralProvider


async def main() -> None:
    provider = MistralProvider()

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

    print("DISPLAY NAME:", provider.metadata.display_name)
    print("STREAMING:", provider.metadata.streaming_supported)
    print("TOOL USE:", provider.metadata.tool_use_supported)
    print("ENTERPRISE READY:", provider.metadata.enterprise_ready)

    await provider.close()

    print("INITIALIZED AFTER CLOSE:", provider.initialized)

    assert provider.initialized is False
    assert health.healthy is True
    assert health.status.value == "ready"
    assert len(models) == 1
    assert models[0].provider == "mistral"
    assert models[0].tier.value == "slm"
    assert provider.metadata.display_name == "Mistral AI"
    assert provider.metadata.streaming_supported is True
    assert provider.metadata.tool_use_supported is False
    assert provider.metadata.enterprise_ready is True

    print("MISTRAL SLM PROVIDER TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
