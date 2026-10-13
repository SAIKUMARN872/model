"""Verify ChromaDB persistence across independent Python processes."""

import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
COLLECTION_NAME = "modelnow_persistence_test"


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}", flush=True)


def worker_write(database_path, payload_path):
    payload = json.loads(Path(payload_path).read_text(encoding="utf-8"))
    client = chromadb.PersistentClient(path=database_path)
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    collection.add(
        ids=payload["ids"],
        documents=payload["documents"],
        embeddings=payload["vectors"],
    )
    print(f"WRITE_COUNT={collection.count()}", flush=True)


def worker_read(database_path, payload_path):
    payload = json.loads(Path(payload_path).read_text(encoding="utf-8"))
    client = chromadb.PersistentClient(path=database_path)
    collection = client.get_collection(name=COLLECTION_NAME)

    check(collection.count() == 4, "Documents survive process shutdown")
    results = collection.query(
        query_embeddings=[payload["query_vector"]],
        n_results=3,
        include=["documents", "distances"],
    )

    ids = results["ids"][0]
    documents = results["documents"][0]
    distances = results["distances"][0]

    check(len(ids) == 3, "Reopened database returns three matches")
    check(ids[0] == "rag", "Relevant RAG document ranks first after reopening")
    check(
        all(math.isfinite(float(distance)) for distance in distances),
        "Retrieved distances are finite",
    )

    print("\nResults after reopening:")
    for rank, (doc_id, document, distance) in enumerate(
        zip(ids, documents, distances), start=1
    ):
        print(f"{rank}. {doc_id} | cosine distance={distance:.4f}")
        print(f"   {document}")

    client.delete_collection(COLLECTION_NAME)
    print("PERSISTENCE_READER_PASS", flush=True)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "write":
        worker_write(sys.argv[2], sys.argv[3])
        return

    if len(sys.argv) > 1 and sys.argv[1] == "read":
        worker_read(sys.argv[2], sys.argv[3])
        return

    print("=" * 72)
    print("MODELNOW CROSS-PROCESS PERSISTENCE TEST")
    print("=" * 72)

    documents = [
        "ModelNow automatically routes AI requests to suitable models.",
        "Password recovery requires verifying the account email.",
        "Retrieval augmented generation grounds answers in relevant documents.",
        "ChromaDB stores and searches embedding vectors.",
    ]
    ids = ["routing", "password", "rag", "chromadb"]

    model = SentenceTransformer(MODEL_NAME)
    vectors = model.encode(
        documents,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )
    query_vector = model.encode(
        "How does retrieval augmented generation find supporting information?",
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    check(len(vectors) == 4, "Real embeddings generated for all documents")
    check(vectors.shape[1] == 384, "Embedding dimension is 384")
    check(
        all(
            math.isfinite(float(value))
            for vector in vectors
            for value in vector
        ),
        "Embedding vectors contain only finite values",
    )

    with tempfile.TemporaryDirectory(prefix="modelnow_persistent_test_") as temp_dir:
        root = Path(temp_dir)
        database_path = str(root / "chroma_db")
        payload_path = root / "payload.json"
        payload_path.write_text(
            json.dumps({
                "ids": ids,
                "documents": documents,
                "vectors": vectors.tolist(),
                "query_vector": query_vector.tolist(),
            }),
            encoding="utf-8",
        )

        script_path = str(Path(__file__).resolve())

        writer = subprocess.run(
            [sys.executable, "-m", "ai.embeddings.persistent_retrieval_test", "write", database_path, str(payload_path)],
            capture_output=True,
            text=True,
        )
        print("\nWriter process:")
        print(writer.stdout, end="")
        if writer.returncode != 0:
            print(writer.stderr)
            raise RuntimeError("ChromaDB writer process failed")
        check("WRITE_COUNT=4" in writer.stdout, "Writer saved all four documents")

        reader = subprocess.run(
            [sys.executable, "-m", "ai.embeddings.persistent_retrieval_test", "read", database_path, str(payload_path)],
            capture_output=True,
            text=True,
        )
        print("\nIndependent reader process:")
        print(reader.stdout, end="")
        if reader.returncode != 0:
            print(reader.stderr)
            raise RuntimeError("ChromaDB reader process failed")
        check(
            "PERSISTENCE_READER_PASS" in reader.stdout,
            "Independent process reopened and queried persisted data",
        )

    print("\nMODELNOW CROSS-PROCESS PERSISTENCE TEST: PASS")


if __name__ == "__main__":
    main()

