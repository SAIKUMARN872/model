"""Real-model integration test for ModelNow embeddings and ChromaDB."""

import math
import tempfile
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


def main():
    print("=" * 72)
    print("MODELNOW REAL-WORLD EMBEDDING INTEGRATION TEST")
    print("=" * 72)

    model = SentenceTransformer(MODEL_NAME)

    documents = [
        "To reset your account password, open Settings and select Reset Password.",
        "A chocolate cake recipe uses flour, cocoa powder, eggs, and sugar.",
        "Python is a programming language used for AI and data engineering.",
        "To recover account access, request a password reset using your email.",
        "The weather forecast predicts rain and cooler temperatures tomorrow.",
    ]

    query = "How can I recover my account password?"

    vectors = model.encode(
        documents,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    query_vector = model.encode(
        query,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    check(len(vectors) == len(documents), "Real model embeds every document")
    check(vectors.shape[1] == 384, "Embedding dimension is 384")
    check(query_vector.shape[0] == 384, "Query embedding dimension matches")
    check(
        all(math.isfinite(float(value)) for vector in vectors for value in vector),
        "Document embeddings contain only finite values",
    )
    check(
        all(math.isfinite(float(value)) for value in query_vector),
        "Query embedding contains only finite values",
    )

    norms = [math.sqrt(sum(float(value) ** 2 for value in vector)) for vector in vectors]
    check(
        all(abs(norm - 1.0) < 1e-4 for norm in norms),
        "Document embeddings are L2-normalized",
    )

    with tempfile.TemporaryDirectory(prefix="modelnow_chroma_test_") as temp_dir:
        client = chromadb.PersistentClient(path=str(Path(temp_dir) / "db"))

        collection = client.get_or_create_collection(
            name="modelnow_real_embedding_test",
            metadata={"hnsw:space": "cosine"},
        )

        collection.add(
            ids=[f"doc-{index}" for index in range(len(documents))],
            documents=documents,
            embeddings=vectors.tolist(),
            metadatas=[
                {"category": "account"},
                {"category": "cooking"},
                {"category": "programming"},
                {"category": "account"},
                {"category": "weather"},
            ],
        )

        check(collection.count() == len(documents), "ChromaDB indexes all documents")

        results = collection.query(
            query_embeddings=[query_vector.tolist()],
            n_results=3,
            include=["documents", "distances", "metadatas"],
        )

        result_ids = results["ids"][0]
        result_documents = results["documents"][0]
        result_distances = results["distances"][0]

        check(len(result_ids) == 3, "ChromaDB returns the top three matches")
        check(
            result_ids[0] in {"doc-0", "doc-3"},
            "Password-recovery document ranks first",
        )
        check(
            all(math.isfinite(float(distance)) for distance in result_distances),
            "Retrieval distances are finite",
        )

        print("\nTop semantic search results:")
        for rank, (doc_id, text, distance) in enumerate(
            zip(result_ids, result_documents, result_distances), start=1
        ):
            print(f"{rank}. {doc_id} | distance={distance:.4f}")
            print(f"   {text}")

        print("\nMODELNOW REAL-WORLD INTEGRATION TEST: PASS")

        client.delete_collection("modelnow_real_embedding_test")
        client._system.stop()
        del collection
        del client

        import gc
        gc.collect()


if __name__ == "__main__":
    main()

