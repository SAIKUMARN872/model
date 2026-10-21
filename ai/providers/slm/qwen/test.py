import asyncio

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.slm.qwen import QwenProvider


async def main() -> None:
    provider = QwenProvider()

    await provider.initialize()

    print("QWEN PROVIDER: INITIALIZED")

    request = ChatRequest(
        model="Qwen/Qwen2.5-0.5B-Instruct",
        messages=[
            ChatMessage(
                role="user",
                content="Explain artificial intelligence in 3 short sentences.",
            )
        ],
        max_tokens=64,
        temperature=0.0,
        stream=True,
    )

    chunk_count = 0
    first_chunk_received = False
    final_chunk = None

    print("===== QWEN STREAM TEST =====")

    async for chunk in provider.stream(request):
        chunk_count += 1

        if not chunk.done:
            if not first_chunk_received:
                first_chunk_received = True
                print("FIRST STREAM CHUNK: PASS")

            print(
                f"CHUNK {chunk_count}: "
                f"{chunk.content!r}"
            )

        if chunk.done:
            final_chunk = chunk
            print("FINAL CHUNK: PASS")

    print("===== STREAM RESULTS =====")
    print("CHUNK COUNT:", chunk_count)
    print("FIRST CHUNK:", first_chunk_received)

    if final_chunk is not None:
        print("FINAL DONE:", final_chunk.done)
        print("FINAL MODEL:", final_chunk.model)
        print("FINAL PROVIDER:", final_chunk.provider)

        if final_chunk.usage is not None:
            print("INPUT TOKENS:", final_chunk.usage.input_tokens)
            print("OUTPUT TOKENS:", final_chunk.usage.output_tokens)
            print("TOTAL TOKENS:", final_chunk.usage.total_tokens)

            print(
                "TTFT MS:",
                final_chunk.usage.metadata.get(
                    "time_to_first_token_ms"
                ),
            )

            print(
                "GENERATION LATENCY MS:",
                final_chunk.usage.metadata.get(
                    "generation_latency_ms"
                ),
            )

    assert chunk_count >= 2, "Expected streaming chunks plus final chunk."
    assert first_chunk_received, "No content stream chunk received."
    assert final_chunk is not None, "No final stream chunk received."
    assert final_chunk.done is True, "Final chunk must have done=True."

    await provider.close()

    print("QWEN STREAM TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
