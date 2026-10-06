import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from ai.runtime.bootstrap import create_runtime
from ai.routing_engine.models import RoutingRequest


async def main():
    runtime = create_runtime()

    await runtime.initialize()

    print("RUNTIME INIT: PASS")
    print("BACKENDS:", runtime.inference_engine.backend_types())
    print("MODEL COUNT:", runtime.model_registry.count())

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": (
                    "Explain artificial intelligence in three simple sentences."
                ),
            }
        ],
        preferred_tier="slm",
        stream=False,
        metadata={
            "test": "runtime_real_inference",
            "execution": "local",
        },
    )

    decision = await runtime.routing_engine.route(request)

    print("ROUTING STATUS:", decision.status.value)
    print("SELECTED MODEL:", decision.model_id)
    print("SELECTED PROVIDER:", decision.provider)
    print("SELECTED TIER:", decision.tier)
    print("ROUTING REASON:", decision.reason)
    print("CANDIDATES:", decision.candidates_considered)

    result = await runtime.adapter.infer(request)

    print("INFERENCE: PASS")
    print("RESULT TYPE:", type(result).__name__)
    print("RESULT:", result)

    metrics = runtime.inference_engine.metrics

    print()
    print("===== OVERALL METRICS =====")
    print("METRICS REQUESTS:", metrics.overall.request_count)
    print("METRICS SUCCESS:", metrics.overall.success_count)
    print("METRICS FAILURES:", metrics.overall.failure_count)
    print("METRICS INPUT TOKENS:", metrics.overall.input_tokens)
    print("METRICS OUTPUT TOKENS:", metrics.overall.output_tokens)
    print("METRICS TOTAL TOKENS:", metrics.overall.total_tokens)
    print("METRICS COST:", metrics.overall.estimated_cost)
    print("METRICS AVG LATENCY:", metrics.overall.average_latency_ms)
    print("METRICS AVG TTFT:", metrics.overall.average_ttft_ms)

    model_metrics = metrics.by_model[decision.model_id]

    print()
    print("===== MODEL METRICS =====")
    print("MODEL REQUESTS:", model_metrics.request_count)
    print("MODEL SUCCESS:", model_metrics.success_count)
    print("MODEL FAILURES:", model_metrics.failure_count)
    print("MODEL INPUT TOKENS:", model_metrics.input_tokens)
    print("MODEL OUTPUT TOKENS:", model_metrics.output_tokens)
    print("MODEL TOTAL TOKENS:", model_metrics.total_tokens)
    print("MODEL COST:", model_metrics.estimated_cost)
    print("MODEL AVG LATENCY:", model_metrics.average_latency_ms)
    print("MODEL AVG TTFT:", model_metrics.average_ttft_ms)

    backend_name = result.backend.value
    backend_metrics = metrics.by_backend[backend_name]

    print()
    print("===== BACKEND METRICS =====")
    print("BACKEND:", backend_name)
    print("BACKEND REQUESTS:", backend_metrics.request_count)
    print("BACKEND SUCCESS:", backend_metrics.success_count)
    print("BACKEND FAILURES:", backend_metrics.failure_count)
    print("BACKEND INPUT TOKENS:", backend_metrics.input_tokens)
    print("BACKEND OUTPUT TOKENS:", backend_metrics.output_tokens)
    print("BACKEND TOTAL TOKENS:", backend_metrics.total_tokens)
    print("BACKEND COST:", backend_metrics.estimated_cost)
    print("BACKEND AVG LATENCY:", backend_metrics.average_latency_ms)
    print("BACKEND AVG TTFT:", backend_metrics.average_ttft_ms)

    print()
    print("===== RUNTIME STREAM TEST =====")

    stream_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": (
                    "Explain machine learning in two short sentences."
                ),
            }
        ],
        preferred_tier="slm",
        stream=True,
        metadata={
            "test": "runtime_real_stream",
            "execution": "local",
        },
    )

    stream_chunks = 0
    content_chunks = 0
    final_chunk = None
    streamed_content: list[str] = []

    async for chunk in runtime.adapter.stream(stream_request):
        stream_chunks += 1

        if chunk.finish_reason is not None:
            final_chunk = chunk
            print("STREAM FINAL CHUNK: PASS")
            continue

        if chunk.content:
            content_chunks += 1
            streamed_content.append(chunk.content)

            if content_chunks == 1:
                print("STREAM FIRST CHUNK: PASS")

            print(
                f"STREAM CHUNK {content_chunks}: "
                f"{chunk.content!r}"
            )

    if content_chunks == 0:
        raise AssertionError(
            "Runtime streaming produced no content chunks."
        )

    if final_chunk is None:
        raise AssertionError(
            "Runtime streaming produced no final chunk."
        )

    if final_chunk.finish_reason != "stop":
        raise AssertionError(
            "Runtime final chunk does not have finish_reason='stop'."
        )

    streamed_text = "".join(streamed_content)

    if not streamed_text.strip():
        raise AssertionError(
            "Runtime streaming produced empty content."
        )

    print()
    print("===== RUNTIME STREAM RESULTS =====")
    print("STREAM CHUNKS:", stream_chunks)
    print("CONTENT CHUNKS:", content_chunks)
    print("STREAM CONTENT LENGTH:", len(streamed_text))
    print("STREAM FINISH REASON:", final_chunk.finish_reason)
    print("STREAM MODEL:", final_chunk.model)
    print("STREAM BACKEND:", final_chunk.backend.value)

    if final_chunk.usage is None:
        raise AssertionError(
            "Runtime final streaming result has no usage."
        )

    print(
        "STREAM INPUT TOKENS:",
        final_chunk.usage.input_tokens,
    )
    print(
        "STREAM OUTPUT TOKENS:",
        final_chunk.usage.output_tokens,
    )
    print(
        "STREAM TOTAL TOKENS:",
        final_chunk.usage.total_tokens,
    )

    print(
        "STREAM TTFT MS:",
        final_chunk.time_to_first_token_ms,
    )

    print(
        "STREAM LATENCY MS:",
        final_chunk.latency_ms,
    )

    print()
    print("RUNTIME STREAM TEST: PASS")

    await runtime.close()

    print()
    print("RUNTIME CLOSE: PASS")


asyncio.run(main())
