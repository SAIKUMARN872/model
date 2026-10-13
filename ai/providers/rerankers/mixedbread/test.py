import asyncio

from ai.providers.rerankers.common import RerankDocument, RerankRequest
from ai.providers.rerankers.mixedbread.config import MixedbreadRerankerConfig
from ai.providers.rerankers.mixedbread.provider import MixedbreadRerankerProvider


async def main():
    config = MixedbreadRerankerConfig(
        model="mixedbread-ai/mxbai-rerank-large-v2",
        mock_mode=True,
    )
    config.validate()
    print("PASS - CONFIGURATION")

    provider = MixedbreadRerankerProvider(config)
    print("PASS - PROVIDER CONSTRUCTION")

    await provider.initialize()
    assert provider.initialized
    print("PASS - INITIALIZATION")

    assert await provider.health_check()
    print("PASS - HEALTH CHECK")

    request = RerankRequest(
        query="ModelNow cost optimization",
        documents=[
            RerankDocument(
                text="ModelNow optimizes AI model cost, latency, and quality.",
                document_id="modelnow",
            ),
            RerankDocument(
                text="Cost optimization selects efficient AI models.",
                document_id="cost",
            ),
            RerankDocument(
                text="A recipe for chocolate cake.",
                document_id="recipe",
            ),
        ],
        top_n=2,
    )

    response = await provider.rerank(request)

    assert response.provider == "mixedbread"
    assert response.model == "mixedbread-ai/mxbai-rerank-large-v2"
    assert len(response.results) == 2
    print("PASS - RERANKING")
    print("PASS - RESULT COUNT")

    scores = [result.score for result in response.results]
    assert scores == sorted(scores, reverse=True)
    print("PASS - SCORE ORDERING")

    assert response.top_result is not None
    print("PASS - TOP RESULT")
    print("TOP INDEX:", response.top_result.index)
    print("TOP SCORE:", round(response.top_result.score, 6))

    info = provider.model_info()
    assert info.id == "mixedbread-ai/mxbai-rerank-large-v2"
    assert info.provider == "mixedbread"
    print("PASS - MODEL INFO")

    await provider.close()
    assert not provider.initialized
    print("PASS - LIFECYCLE")

    print("PASS - MIXEDBREAD RERANKER INTEGRATION TEST")


if __name__ == "__main__":
    asyncio.run(main())
