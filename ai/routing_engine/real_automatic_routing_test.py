from __future__ import annotations

import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.providers.bootstrap import CanonicalProviderBootstrap
from ai.routing_engine.models import RoutingRequest
from ai.routing_engine.engine import RoutingEngine


PROMPTS = [
    (
        "SIMPLE",
        "What is 2 + 2?",
    ),
    (
        "GENERAL",
        "Explain how a REST API works in simple terms.",
    ),
    (
        "CODING",
        "Write a Python function that removes duplicate values from a list and explain its time complexity.",
    ),
    (
        "COMPLEX",
        "Design an enterprise multi-agent AI architecture with RAG, memory, tool execution, security, observability, governance, failure recovery, and scalable distributed execution.",
    ),
]


async def main() -> None:
    print("=" * 100)
    print("MODELNOW REAL AUTOMATIC ROUTING TEST")
    print("=" * 100)

    registry = ModelRegistryEngine()
    bootstrap = CanonicalProviderBootstrap(registry)

    await bootstrap.load()

    print(f"REGISTERED MODELS: {registry.count()}")
    print()

    router = RoutingEngine(registry=registry)

    for category, prompt in PROMPTS:
        print("-" * 100)
        print(f"TEST: {category}")
        print(f"PROMPT: {prompt}")
        print()

        request = RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        )

        try:
            result = await router.route(request)

            print("ROUTING RESULT:")
            print(result)

        except Exception as exc:
            print(f"ROUTING ERROR: {type(exc).__name__}: {exc}")

        print()


if __name__ == "__main__":
    asyncio.run(main())
