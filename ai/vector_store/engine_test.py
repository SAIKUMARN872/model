"""Offline tests for the ModelNow vector-store engine."""

from .engine import VectorStoreEngine
from .schemas import SearchRequest, VectorStoreConfig


class FakeStore:
    def __init__(self):
        self.documents = []

    def add_documents(self, documents):
        self.documents.extend(documents)
        return len(documents)

    def search(self, *, query_vector, top_k, filters):
        return [
            {"document_id": "doc-1", "text": "vector search", "score": 0.95},
            {"document_id": "doc-2", "text": "database index", "score": 0.70},
        ][:top_k]


def run_tests():
    store = FakeStore()
    engine = VectorStoreEngine(
        store,
        VectorStoreConfig(
            backend="fake",
            collection_name="ModelNowDocuments",
            dimension=3,
        ),
    )

    assert engine.backend == "fake"
    assert engine.status().initialized
    print("PASS: engine initialization and status")

    count = engine.add_documents([
        {"document_id": "doc-1", "text": "vector search"},
    ])
    assert count == 1
    print("PASS: document validation and delegated insertion")

    response = engine.search(
        request=SearchRequest(query_vector=[0.1, 0.2, 0.3], top_k=1)
    )
    assert response.count == 1
    assert response.results[0]["document_id"] == "doc-1"
    assert response.backend == "fake"
    print("PASS: vector validation, top-k, and normalized response")

    try:
        engine.search(query_vector=[0.1, 0.2], top_k=1)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid vector dimension was accepted")

    try:
        engine.add_documents([{"document_id": "", "text": "bad"}])
    except ValueError:
        pass
    else:
        raise AssertionError("invalid document was accepted")
    print("PASS: invalid dimensions and document IDs rejected")

    print("MODELNOW VECTOR STORE ENGINE TEST: PASS")


if __name__ == "__main__":
    run_tests()
