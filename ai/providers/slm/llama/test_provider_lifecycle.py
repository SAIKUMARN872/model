import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[4]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.providers.slm.llama.provider import LlamaProvider


async def main():
    provider = LlamaProvider()

    await provider.initialize()

    health = await provider.health_check()
    models = await provider.list_models()

    print("INITIALIZED:", provider.initialized)
    print("HEALTHY:", health.healthy)
    print("STATUS:", health.status.value)
    print("MODEL COUNT:", len(models))
    print("DISPLAY NAME:", provider.metadata.display_name)
    print("STREAMING:", provider.metadata.streaming_supported)

    await provider.close()

    print("INITIALIZED AFTER CLOSE:", provider.initialized)


asyncio.run(main())
