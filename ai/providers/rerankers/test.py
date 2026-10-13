from ai.providers.rerankers import (
    RerankerSelector,
    create_default_reranker_registry,
)
from ai.providers.rerankers.bge.provider import BGEProvider
from ai.providers.rerankers.cohere.provider import CohereRerankerProvider
from ai.providers.rerankers.jina.provider import JinaRerankerProvider
from ai.providers.rerankers.mixedbread.provider import MixedbreadRerankerProvider


def main():
    registry = create_default_reranker_registry()

    expected = {
        "bge": BGEProvider,
        "cohere": CohereRerankerProvider,
        "jina": JinaRerankerProvider,
        "mixedbread": MixedbreadRerankerProvider,
    }

    assert registry.count() == 4
    print("PASS - DEFAULT REGISTRY COUNT")

    for provider_id, expected_class in expected.items():
        assert registry.exists(provider_id)
        assert registry.get(provider_id) is expected_class
        print(f"PASS - REGISTERED {provider_id.upper()}")

    assert registry.names() == [
        "bge",
        "cohere",
        "jina",
        "mixedbread",
    ]
    print("PASS - REGISTRY NAMES")

    selector = RerankerSelector(registry)

    for provider_id, expected_class in expected.items():
        selection = selector.select(provider_id)
        assert selection.provider_id == provider_id
        assert selection.reranker_class is expected_class
        assert selector.supports(provider_id)
        print(f"PASS - SELECTOR {provider_id.upper()}")

    assert selector.supports(" MIXEDBREAD ")
    assert selector.select(" MIXEDBREAD ").reranker_class is MixedbreadRerankerProvider
    print("PASS - CASE AND WHITESPACE NORMALIZATION")

    assert not selector.supports("unknown-provider")
    print("PASS - UNKNOWN PROVIDER CHECK")

    print("PASS - RERANKER REGISTRY INTEGRATION TEST")


if __name__ == "__main__":
    main()

