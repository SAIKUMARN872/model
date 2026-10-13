from __future__ import annotations

import os

from ai.providers.llm.google.client import (
    GoogleAuthenticationError,
    GoogleClient,
    GoogleClientError,
)
from ai.providers.llm.google.config import GoogleConfig


def main() -> None:
    print("=" * 100)
    print("MODELNOW GOOGLE REAL DISCOVERY TEST")
    print("=" * 100)

    config = GoogleConfig.from_env()

    if not config.api_key:
        print("GOOGLE API KEY: NOT CONFIGURED")
        print("REAL DISCOVERY: SKIPPED")
        print("Set GOOGLE_API_KEY or GEMINI_API_KEY to enable this test.")
        print("=" * 100)
        return

    print("GOOGLE API KEY: CONFIGURED")
    print(f"BASE URL: {config.base_url}")

    client = GoogleClient(config)

    try:
        response = client.list_models()

        assert isinstance(response, dict)

        models = response.get("models", [])

        assert isinstance(models, list)

        print(f"DISCOVERED MODELS: {len(models)}")

        if models:
            print("-" * 100)

            for model in models[:10]:
                if not isinstance(model, dict):
                    continue

                name = model.get("name", "unknown")
                display_name = model.get(
                    "displayName",
                    "unknown",
                )

                print(
                    f"MODEL: {name} | "
                    f"DISPLAY: {display_name}"
                )

            if len(models) > 10:
                print(
                    f"... and {len(models) - 10} more models"
                )

        print("-" * 100)
        print("REAL GOOGLE DISCOVERY: PASS")

    except GoogleAuthenticationError as exc:
        print("REAL GOOGLE DISCOVERY: AUTHENTICATION FAILED")
        print(str(exc))

    except GoogleClientError as exc:
        print("REAL GOOGLE DISCOVERY: FAILED")
        print(str(exc))

    finally:
        print("=" * 100)


if __name__ == "__main__":
    main()
