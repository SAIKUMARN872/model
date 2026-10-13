from __future__ import annotations

import time

from .client import CohereClient
from .config import CohereConfig


def _get(model: dict, *keys, default=None):
    for key in keys:
        value = model.get(key)
        if value is not None:
            return value
    return default


def _capability_count(model: dict) -> int:
    capabilities = model.get("capabilities")

    if isinstance(capabilities, list):
        return len(capabilities)

    if isinstance(capabilities, dict):
        return len(capabilities)

    endpoints = model.get("endpoints")

    if isinstance(endpoints, list):
        return len(endpoints)

    return 0


def _is_chat_model(model: dict) -> bool:
    if model.get("deprecated") is True:
        return False

    endpoints = model.get("endpoints")

    if isinstance(endpoints, list) and endpoints:
        return "chat" in {
            str(endpoint).lower()
            for endpoint in endpoints
        }

    return True


def main() -> None:
    print("=" * 80)
    print("MODELNOW COHERE REAL MODEL DISCOVERY")
    print("=" * 80)

    config = CohereConfig.from_env()

    if not config.api_key:
        print("COHERE MODEL DISCOVERY: FAIL")
        print("error=COHERE_API_KEY is not configured.")
        return

    client = CohereClient(config)

    started = time.perf_counter()

    try:
        result = client.list_models(page_size=100)
    except Exception as exc:
        print("COHERE MODEL DISCOVERY: FAIL")
        print(f"error={exc}")
        return

    latency_ms = (time.perf_counter() - started) * 1000.0

    if not isinstance(result, dict):
        print("COHERE MODEL DISCOVERY: FAIL")
        print("error=Unexpected Cohere API response.")
        return

    models = result.get("models", [])

    active_models = [
        model
        for model in models
        if isinstance(model, dict)
        and _is_chat_model(model)
    ]

    print("COHERE MODEL DISCOVERY: PASS")
    print(f"model_count= {len(active_models)}")
    print(f"discovery_latency_ms= {latency_ms:.2f}")

    for model in active_models:
        model_id = _get(
            model,
            "name",
            "id",
            "model",
            default="unknown",
        )

        context = _get(
            model,
            "context_length",
            "context_window",
            default=0,
        )

        quality = _get(
            model,
            "quality_score",
            default=0.0,
        )

        input_cost = _get(
            model,
            "input_cost_per_1m_tokens",
            default=0.0,
        )

        output_cost = _get(
            model,
            "output_cost_per_1m_tokens",
            default=0.0,
        )

        tier = _get(
            model,
            "tier",
            default="llm",
        )

        capabilities = _capability_count(model)

        print(
            f"  model={model_id}"
            f" | provider=cohere"
            f" | tier={tier}"
            f" | context={context}"
            f" | quality={quality}"
            f" | input_cost={input_cost}"
            f" | output_cost={output_cost}"
            f" | capabilities={capabilities}"
        )

    print("=" * 80)


if __name__ == "__main__":
    main()
