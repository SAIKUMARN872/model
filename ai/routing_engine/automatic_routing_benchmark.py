from __future__ import annotations

import asyncio
from collections import Counter

from ai.model_registry.engine import ModelRegistryEngine
from ai.providers.bootstrap import CanonicalProviderBootstrap
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.models import RoutingRequest


TEST_CASES = [
    (
        "SIMPLE_QA",
        "What is 2 + 2?",
    ),
    (
        "SIMPLE_FACT",
        "What is the capital of France?",
    ),
    (
        "GENERAL_EXPLANATION",
        "Explain how a REST API works in simple terms.",
    ),
    (
        "SUMMARIZATION",
        "Summarize the purpose of a database index in simple terms.",
    ),
    (
        "CODING",
        "Write a Python function that removes duplicate values from a list and explain its time complexity.",
    ),
    (
        "CODE_DEBUGGING",
        "Find the bug in this Python code: for i in range(len(items)): print(items[i+1])",
    ),
    (
        "MATH_REASONING",
        "A train travels 240 km in 3 hours. What is its average speed?",
    ),
    (
        "STRUCTURED_OUTPUT",
        "Return a JSON object containing a person's name, age, and email address.",
    ),
    (
        "TOOL_USE",
        "Create a plan for searching a company's customer records and updating the customer's address.",
    ),
    (
        "RAG",
        "Answer a question using retrieved enterprise documents and explain which document evidence supports the answer.",
    ),
    (
        "LONG_CONTEXT",
        "Analyze a large enterprise policy document and identify conflicts between its security, compliance, and access-control requirements.",
    ),
    (
        "AGENTIC",
        "Plan an automated workflow that researches products, compares prices, asks for approval, purchases the selected product, and verifies the order.",
    ),
    (
        "SECURITY",
        "Design a secure architecture for an enterprise AI platform with authentication, authorization, secrets management, audit logging, sandboxing, and policy enforcement.",
    ),
    (
        "DATA_ANALYSIS",
        "Analyze a business dataset and explain how to identify anomalies, trends, correlations, and useful KPIs.",
    ),
    (
        "ENTERPRISE_ARCHITECTURE",
        "Design an enterprise multi-agent AI architecture with RAG, memory, tool execution, security, observability, governance, failure recovery, and scalable distributed execution.",
    ),
]


async def main() -> None:
    print("=" * 110)
    print("MODELNOW AUTOMATIC ROUTING BENCHMARK")
    print("=" * 110)

    registry = ModelRegistryEngine()
    bootstrap = CanonicalProviderBootstrap(registry)

    await bootstrap.load()

    router = RoutingEngine(registry=registry)

    print(f"REGISTERED MODELS : {registry.count()}")
    print(f"TEST CASES        : {len(TEST_CASES)}")
    print()

    results = []
    tier_counts = Counter()
    provider_counts = Counter()
    policy_counts = Counter()

    for number, (category, prompt) in enumerate(TEST_CASES, start=1):
        request = RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        )

        print("-" * 110)
        print(f"[{number:02d}/{len(TEST_CASES):02d}] {category}")
        print(f"Prompt: {prompt}")

        try:
            decision = await router.route(request)

            metadata = decision.metadata

            tier = decision.tier.upper()
            provider = decision.provider

            tier_counts[tier] += 1
            provider_counts[provider] += 1

            for policy in metadata.get("policies_applied", ()):
                policy_counts[policy] += 1

            results.append(decision)

            print()
            print(f"Selected Model : {decision.model_id}")
            print(f"Provider       : {provider}")
            print(f"Tier           : {tier}")
            print(f"Score          : {decision.score:.4f}")
            print(f"Candidates     : {decision.candidates_considered}")
            print(
                f"Adaptive       : "
                f"{metadata.get('adaptive_applied', False)}"
            )
            print(
                f"Preferred Tier : "
                f"{metadata.get('preferred_tier')}"
            )
            print(
                f"Policies       : "
                f"{metadata.get('policies_applied', ())}"
            )

        except Exception as exc:
            print()
            print(f"ROUTING ERROR: {type(exc).__name__}: {exc}")

    print()
    print("=" * 110)
    print("MODELNOW ROUTING SUMMARY")
    print("=" * 110)

    print()
    print("TIER DISTRIBUTION")
    print("-" * 50)

    for tier in ("SLM", "MLM", "LLM"):
        count = tier_counts[tier]
        percentage = (
            count / len(results) * 100
            if results
            else 0
        )

        print(
            f"{tier:<8} : "
            f"{count:>3} "
            f"({percentage:>5.1f}%)"
        )

    print()
    print("PROVIDER DISTRIBUTION")
    print("-" * 50)

    for provider, count in provider_counts.most_common():
        print(f"{provider:<15} : {count}")

    print()
    print("POLICY USAGE")
    print("-" * 50)

    for policy, count in policy_counts.most_common():
        print(f"{policy:<25} : {count}")

    print()
    print("ROUTING HEALTH")
    print("-" * 50)

    print(f"Successful routes : {len(results)}")
    print(f"Failed routes     : {len(TEST_CASES) - len(results)}")

    adaptive_count = sum(
        1
        for result in results
        if result.metadata.get("adaptive_applied", False)
    )

    print(f"Adaptive routes   : {adaptive_count}")

    if results:
        average_score = sum(
            result.score for result in results
        ) / len(results)

        print(f"Average score     : {average_score:.4f}")

    print()
    print("=" * 110)
    print("BENCHMARK COMPLETE")
    print("=" * 110)


if __name__ == "__main__":
    asyncio.run(main())
