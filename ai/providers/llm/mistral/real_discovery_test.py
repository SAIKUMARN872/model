from __future__ import annotations

from ai.providers.llm.mistral.client import (
    MistralAuthenticationError,
    MistralClient,
    MistralClientError,
)
from ai.providers.llm.mistral.config import MistralConfig


def main() -> None:
    print("=" * 100)
    print("MODELNOW MISTRAL REAL DISCOVERY TEST")
    print("=" * 100)

    config = MistralConfig.from_env()

    if not config.api_key:
        print("MISTRAL API KEY: NOT CONFIGURED")
        print("REAL DISCOVERY: SKIPPED")
        print(
            "Set MISTRAL_API_KEY to enable this test."
        )
        print("=" * 100)
        return

    print("MISTRAL API KEY: CONFIGURED")
    print(f"BASE URL: {config.base_url}")

    client = MistralClient(config)

    try:
        response = client.list_models()

        assert isinstance(response, dict)

        models = response.get("data", [])

        assert isinstance(models, list)

        print(
            f"DISCOVERED MODELS: {len(models)}"
        )

        if models:
            print("-" * 100)

            for model in models[:10]:
                if not isinstance(model, dict):
                    continue

                model_id = model.get(
                    "id",
                    "unknown",
                )

                owned_by = model.get(
                    "owned_by",
                    "unknown",
                )

                print(
                    f"MODEL: {model_id} | "
                    f"OWNER: {owned_by}"
                )

            if len(models) > 10:
                print(
                    f"... and {len(models) - 10} more models"
                )

        print("-" * 100)
        print("REAL MISTRAL DISCOVERY: PASS")

    except MistralAuthenticationError as exc:
        print(
            "REAL MISTRAL DISCOVERY: "
            "AUTHENTICATION FAILED"
        )
        print(str(exc))

    except MistralClientError as exc:
        print(
            "REAL MISTRAL DISCOVERY: FAILED"
        )
        print(str(exc))

    print("=" * 100)


if __name__ == "__main__":
    main()
