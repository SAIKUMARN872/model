from __future__ import annotations

import asyncio

from .config import DeepSeekConfig
from .client import (
    DeepSeekAuthenticationError,
    DeepSeekClient,
    DeepSeekClientError,
)


async def main() -> None:
    print("=" * 100)
    print("MODELNOW DEEPSEEK REAL DISCOVERY TEST")
    print("=" * 100)

    config = DeepSeekConfig.from_env()

    print("PROVIDER:", config.provider_id)
    print("BASE URL:", config.base_url)
    print("API KEY CONFIGURED:", bool(config.api_key))
    print("ENABLED:", config.enabled)

    if not config.api_key:
        print()
        print("DEEPSEEK_API_KEY is not configured.")
        print("REAL DISCOVERY: SKIPPED")
        print("=" * 100)
        return

    client = DeepSeekClient(config)

    try:
        response = client.list_models()

        print()
        print("REAL API RESPONSE: PASS")

        data = response.get("data", [])

        if isinstance(data, list):
            print("REMOTE MODEL COUNT:", len(data))

            for model in data:
                if not isinstance(model, dict):
                    continue

                print(
                    "MODEL:",
                    model.get("id"),
                )

                if model.get("owned_by") is not None:
                    print(
                        "  OWNED BY:",
                        model.get("owned_by"),
                    )

        print()
        print("MODELNOW DEEPSEEK REAL DISCOVERY: PASS")

    except DeepSeekAuthenticationError as exc:
        print()
        print("REAL DISCOVERY: AUTHENTICATION FAILED")
        print(str(exc))

    except DeepSeekClientError as exc:
        print()
        print("REAL DISCOVERY: FAILED")
        print(str(exc))

    except Exception as exc:
        print()
        print("REAL DISCOVERY: UNEXPECTED FAILURE")
        print(type(exc).__name__)
        print(str(exc))

    print("=" * 100)


if __name__ == "__main__":
    asyncio.run(main())
