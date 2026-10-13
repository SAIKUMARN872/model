from ai.embeddings.engine import EmbeddingEngine
from ai.embeddings.exceptions import (
    EmbeddingValidationError, EmbeddingProviderError
)

class FakeProvider:
    model_name = "fake-test-model"

    def embed(self, texts):
        return [[3.0, 4.0] for _ in texts]

def run():
    checks = 0
    engine = EmbeddingEngine(FakeProvider())
    result = engine.embed_texts(["hello", "world"])
    assert result.count == 2 and result.dimension == 2
    assert all(abs(sum(x*x for x in v) - 1.0) < 1e-8 for v in result.embeddings)
    print("PASS: batch embeddings and L2 normalization"); checks += 1

    assert engine.embed_query("hello") == [0.6, 0.8]
    print("PASS: single-query embedding"); checks += 1

    result = engine.embed_texts(["hello"], normalize=False)
    assert result.embeddings == [[3.0, 4.0]]
    print("PASS: optional normalization"); checks += 1

    try:
        engine.embed_texts([" "])
    except EmbeddingValidationError:
        print("PASS: invalid text inputs rejected"); checks += 1
    else:
        raise AssertionError("Empty text was accepted")

    class BadProvider:
        model_name = "bad"
        def embed(self, texts):
            return []

    try:
        EmbeddingEngine(BadProvider()).embed_texts(["hello"])
    except EmbeddingValidationError:
        print("PASS: incorrect provider output rejected"); checks += 1
    else:
        raise AssertionError("Incorrect provider output was accepted")

    class FailingProvider:
        model_name = "failing"
        def embed(self, texts):
            raise RuntimeError("simulated failure")

    try:
        EmbeddingEngine(FailingProvider()).embed_texts(["hello"])
    except EmbeddingProviderError:
        print("PASS: provider errors handled"); checks += 1
    else:
        raise AssertionError("Provider failure was not handled")

    print(f"MODELNOW EMBEDDING CORE TEST: PASS ({checks}/6 checks)")

if __name__ == "__main__":
    run()
