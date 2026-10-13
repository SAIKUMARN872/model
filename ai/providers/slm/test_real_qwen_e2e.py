from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers.engine import TransformersBackend
from ai.inference_engine.engine import InferenceEngine
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.utils import model_info_to_record
from ai.providers.slm.qwen import QwenProvider
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.models import RoutingRequest


async def main() -> None:
    print("=" * 70)
    print("MODELNOW REAL SLM E2E TEST")
    print("=" * 70)

    # ------------------------------------------------------------
    # 1. Create the real Qwen provider
    # ------------------------------------------------------------
    provider = QwenProvider()

    print("\n[1] QWEN PROVIDER")
    print("Provider:", provider.config.provider_id)
    print("Default model:", provider.config.default_model)

    # ------------------------------------------------------------
    # 2. Initialize provider
    # ------------------------------------------------------------
    await provider.initialize()

    print("\n[2] PROVIDER INITIALIZED")

    # ------------------------------------------------------------
    # 3. Discover real Qwen model metadata
    # ------------------------------------------------------------
    model_infos = await provider.list_models()

    print("\n[3] MODEL DISCOVERY")
    print("Models discovered:", len(model_infos))

    for model in model_infos:
        print(
            f"  - {model.id}"
            f" | tier={model.tier.value}"
            f" | quality={model.quality_score}"
        )

    # ------------------------------------------------------------
    # 4. Build canonical Model Registry
    # ------------------------------------------------------------
    registry = ModelRegistryEngine()

    records = [
        model_info_to_record(model)
        for model in model_infos
    ]

    registry.register_many(records)

    print("\n[4] MODEL REGISTRY")
    print("Registered models:", registry.count())

    # ------------------------------------------------------------
    # 5. Build real Transformers backend
    #    with the REAL Qwen provider
    # ------------------------------------------------------------
    transformers_backend = TransformersBackend(
        providers=[provider]
    )

    inference_engine = InferenceEngine(
        backends=[transformers_backend]
    )

    print("\n[5] INFERENCE ENGINE")
    print("Transformers backend registered.")

    # ------------------------------------------------------------
    # 6. Build routing engine using canonical registry
    # ------------------------------------------------------------
    routing_engine = RoutingEngine(
        registry=registry
    )

    print("\n[6] ROUTING ENGINE")
    print("Routing engine ready.")

    # ------------------------------------------------------------
    # 7. Connect routing -> inference
    # ------------------------------------------------------------
    adapter = RoutingInferenceAdapter(
        routing_engine=routing_engine,
        inference_engine=inference_engine,
    )

    print("\n[7] ROUTING -> INFERENCE ADAPTER")
    print("Adapter ready.")

    # ------------------------------------------------------------
    # 8. Create actual user request
    # ------------------------------------------------------------
    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": (
                    "Explain what artificial intelligence is "
                    "in three simple sentences."
                ),
            }
        ],
        preferred_tier="slm",
        stream=False,
        metadata={
            "test": "real_qwen_e2e",
            "execution": "local",
        },
    )

    print("\n[8] USER REQUEST")
    print("Prompt:", request.messages[0]["content"])

    # ------------------------------------------------------------
    # 9. Route request
    # ------------------------------------------------------------
    decision = await routing_engine.route(request)

    print("\n[9] ROUTING DECISION")
    print("Status:", decision.status)
    print("Model:", decision.model_id)
    print("Provider:", decision.provider)
    print("Tier:", decision.tier)
    print("Score:", decision.score)
    print("Reason:", decision.reason)
    print("Candidates:", decision.candidates_considered)

    # ------------------------------------------------------------
    # 10. REAL INFERENCE
    # ------------------------------------------------------------
    print("\n[10] REAL LOCAL INFERENCE")
    print("Loading model / generating response...")
    print("This may take some time on CPU.\n")

    result = await adapter.infer(request)

    # ------------------------------------------------------------
    # 11. Display result
    # ------------------------------------------------------------
    print("\n[11] REAL RESPONSE")
    print("-" * 70)
    print(result.content)
    print("-" * 70)

    print("\n[12] INFERENCE RESULT")
    print("Status:", result.status)
    print("Model:", result.model)
    print("Backend:", result.backend)
    print("Latency:", result.latency_ms)
    print("Finish reason:", result.finish_reason)

    print("\n[13] USAGE")
    print("Input tokens:", result.usage.input_tokens)
    print("Output tokens:", result.usage.output_tokens)
    print("Total tokens:", result.usage.total_tokens)
    print("Estimated cost:", result.usage.estimated_cost)

    # ------------------------------------------------------------
    # 14. Shutdown
    # ------------------------------------------------------------
    await inference_engine.close()
    await provider.close()

    print("\n[14] SHUTDOWN")
    print("Inference engine closed.")
    print("Qwen provider closed.")

    print("\n" + "=" * 70)
    print("REAL SLM E2E TEST: PASS")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
