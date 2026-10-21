from __future__ import annotations

import time

from ...base.config import ProviderConfig
from ...base.request import (
    ChatMessage,
    ChatRequest,
)

from .client import CohereClient
from .config import CohereConfig
from .provider import CohereProvider


MAX_MODELS_TO_TEST = 5


def discover_chat_models(
    client: CohereClient,
) -> list[str]:
    """Discover active Cohere chat models."""

    result = client.list_models()

    models = result.get(
        "models",
        [],
    )

    discovered: list[str] = []

    for model in models:
        if not isinstance(model, dict):
            continue

        name = model.get("name")

        if not name:
            continue

        if model.get(
            "is_deprecated",
            False,
        ):
            continue

        endpoints = model.get(
            "endpoints",
            [],
        )

        if "chat" in endpoints:
            discovered.append(name)

    return discovered


def main() -> None:
    print("=" * 100)
    print("MODELNOW COHERE REAL MULTI-MODEL CHAT TEST")
    print("=" * 100)

    config = CohereConfig.from_env()

    if not config.api_key:
        print()
        print(
            "FAIL - COHERE_API_KEY is not configured."
        )
        print()
        print(
            'Set it first: $env:COHERE_API_KEY="YOUR_REAL_COHERE_API_KEY"'
        )
        return

    provider_config = ProviderConfig(
        provider_id="cohere",
        api_key=config.api_key,
        base_url=config.base_url,
        enabled=True,
    )

    provider = CohereProvider(
        config=provider_config,
        cohere_config=config,
    )

    client = CohereClient(config)

    try:
        models = discover_chat_models(
            client
        )

        if not models:
            print(
                "FAIL - No active Cohere chat models discovered."
            )
            return

        models = models[
            :MAX_MODELS_TO_TEST
        ]

        print()
        print(
            f"DISCOVERED CHAT MODELS: "
            f"{len(models)}"
        )

        print(
            f"MODELS SELECTED FOR TEST: "
            f"{len(models)}"
        )

        print()

        await_initialize(
            provider
        )

        results = []

        for index, model_id in enumerate(
            models,
            start=1,
        ):
            print("=" * 100)
            print(
                f"TEST {index}/{len(models)}"
            )
            print(
                f"MODEL: {model_id}"
            )
            print("=" * 100)

            request = ChatRequest(
                model=model_id,
                messages=[
                    ChatMessage(
                        role="user",
                        content=(
                            "Answer in one short sentence: "
                            "What is ModelNow?"
                        ),
                    )
                ],
                temperature=0.2,
                max_tokens=100,
                stream=False,
            )

            started = time.perf_counter()

            try:
                response = run_chat(
                    provider,
                    request,
                )

                latency = (
                    time.perf_counter()
                    - started
                ) * 1000.0

                print(
                    "STATUS: PASS"
                )

                print(
                    f"LATENCY: "
                    f"{latency:.2f} ms"
                )

                print(
                    f"RESPONSE: "
                    f"{response.content}"
                )

                print(
                    f"REQUEST ID: "
                    f"{response.request_id}"
                )

                print(
                    f"FINISH: "
                    f"{response.finish_reason}"
                )

                print(
                    "INPUT TOKENS: "
                    f"{response.usage.input_tokens}"
                )

                print(
                    "OUTPUT TOKENS: "
                    f"{response.usage.output_tokens}"
                )

                print(
                    "TOTAL TOKENS: "
                    f"{response.usage.total_tokens}"
                )

                results.append(
                    (
                        model_id,
                        True,
                        latency,
                    )
                )

            except Exception as exc:
                latency = (
                    time.perf_counter()
                    - started
                ) * 1000.0

                print(
                    "STATUS: FAIL"
                )

                print(
                    f"LATENCY: "
                    f"{latency:.2f} ms"
                )

                print(
                    f"ERROR: "
                    f"{type(exc).__name__}: {exc}"
                )

                results.append(
                    (
                        model_id,
                        False,
                        latency,
                    )
                )

            print()

        print("=" * 100)
        print("COHERE MULTI-MODEL SUMMARY")
        print("=" * 100)

        passed = 0
        failed = 0

        for model_id, success, latency in results:
            status = (
                "PASS"
                if success
                else "FAIL"
            )

            print(
                f"{status:<6} "
                f"{model_id:<45} "
                f"{latency:>10.2f} ms"
            )

            if success:
                passed += 1
            else:
                failed += 1

        print()
        print(
            f"PASSED: {passed}"
        )
        print(
            f"FAILED: {failed}"
        )
        print(
            f"TOTAL:  {len(results)}"
        )

        if passed > 0:
            print()
            print(
                "PASS - COHERE REAL MULTI-MODEL CHAT"
            )
        else:
            print()
            print(
                "FAIL - NO COHERE MODEL COMPLETED CHAT"
            )

    finally:
        close_provider(
            provider
        )


def await_initialize(
    provider: CohereProvider,
) -> None:
    import asyncio

    asyncio.run(
        provider.initialize()
    )


def run_chat(
    provider: CohereProvider,
    request: ChatRequest,
):
    import asyncio

    return asyncio.run(
        provider.chat(request)
    )


def close_provider(
    provider: CohereProvider,
) -> None:
    import asyncio

    asyncio.run(
        provider.close()
    )


if __name__ == "__main__":
    main()
