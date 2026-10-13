from __future__ import annotations

import asyncio

from .config import JinaRerankerConfig
from .provider import JinaRerankerProvider
from ..common import RerankDocument, RerankRequest


async def main() -> None:
    print("=" * 80)
    print("MODELNOW JINA RERANKER INTEGRATION TEST")
    print("=" * 80)

    config = JinaRerankerConfig(
        model="jina-reranker-v2-base-multilingual",
        mock_mode=True,
    )

    config.validate()
    print("CONFIGURATION: PASS")

    provider = JinaRerankerProvider(config)
    print("PROVIDER CONSTRUCTION: PASS")

    await provider.initialize()
    assert provider.initialized
    print("INITIALIZATION: PASS")

    assert await provider.health_check()
    print("HEALTH CHECK: PASS")

    request = RerankRequest(
        query="ModelNow cost optimization",
        documents=[
            RerankDocument(
                text="ModelNow optimizes AI inference cost "
                "using intelligent model routing."
            ),
            RerankDocument(
                text="Python is a programming language "
                "used for software applications."
            ),
            RerankDocument(
                text="ModelNow improves cost, latency, "
                "and quality through automatic routing."
            ),
        ],
        top_n=2,
    )

    response = await provider.rerank(request)

    assert response.provider == "jina"
    assert response.model == "jina-reranker-v2-base-multilingual"
    assert len(response.results) == 2
    print("RERANKING: PASS")

    assert (
        response.results[0].score
        >= response.results[1].score
    )
    print("SCORE ORDERING: PASS")

    assert response.top_result is not None
    print("TOP RESULT: PASS")
    print(f"TOP INDEX: {response.top_result.index}")
    print(f"TOP SCORE: {response.top_result.score}")

    model_info = provider.model_info()
    assert model_info.id == "jina-reranker-v2-base-multilingual"
    assert model_info.provider == "jina"
    print("MODEL INFO: PASS")

    await provider.close()
    assert not provider.initialized
    print("LIFECYCLE: PASS")

    print("=" * 80)
    print("PASS - JINA RERANKER INTEGRATION TEST")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
