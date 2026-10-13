from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from ..constants import (
    DEFAULT_EMBEDDING_MODEL,
    KNOWLEDGE_DATA_DIR,
)
from ..utils import safe_collection_name
from ..exceptions import RetrievalError


class KnowledgeIndexer:
    def __init__(
        self,
        data_dir: Path | None = None,
        model_name: str = DEFAULT_EMBEDDING_MODEL,
    ):
        root = Path(data_dir or KNOWLEDGE_DATA_DIR)
        self.vector_dir = root / "vectors"
        self.vector_dir.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(self.vector_dir))
        self.model = SentenceTransformer(model_name)

    def _collection(self, collection_id: str):
        name = safe_collection_name(collection_id)
        return self.client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(self, chunks: list[dict]) -> None:
        if not chunks:
            return

        collection_id = chunks[0]["collection_id"]
        if any(item["collection_id"] != collection_id for item in chunks):
            raise ValueError("A batch can contain only one collection.")

        collection = self._collection(collection_id)
        texts = [item["text"] for item in chunks]
        vectors = self.model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )

        for start in range(0, len(chunks), 128):
            batch = chunks[start:start + 128]
            batch_vectors = vectors[start:start + 128]
            collection.upsert(
                ids=[item["chunk_id"] for item in batch],
                documents=[item["text"] for item in batch],
                embeddings=batch_vectors.tolist(),
                metadatas=[{
                    "document_id": item["document_id"],
                    "collection_id": item["collection_id"],
                    "filename": item["filename"],
                    "chunk_index": item["chunk_index"],
                } for item in batch],
            )

    def search(
        self,
        question: str,
        collection_id: str = "default",
        top_k: int = 5,
    ) -> list[dict]:
        if top_k < 1 or top_k > 100:
            raise ValueError("top_k must be between 1 and 100.")

        try:
            collection = self._collection(collection_id)
            if collection.count() == 0:
                return []

            vector = self.model.encode(
                [question],
                normalize_embeddings=True,
                convert_to_numpy=True,
                show_progress_bar=False,
            )[0]

            result = collection.query(
                query_embeddings=[vector.tolist()],
                n_results=min(top_k, collection.count()),
                include=["documents", "metadatas", "distances"],
            )

            matches = []
            for index, text in enumerate(result["documents"][0]):
                metadata = result["metadatas"][0][index] or {}
                distance = float(result["distances"][0][index])
                matches.append({
                    "text": text,
                    "document_id": metadata.get("document_id", ""),
                    "filename": metadata.get("filename", ""),
                    "chunk_id": result["ids"][0][index],
                    "score": 1.0 - distance,
                    "distance": distance,
                    "metadata": metadata,
                })
            return matches

        except Exception as exc:
            raise RetrievalError(f"Knowledge retrieval failed: {exc}") from exc

    def delete_document(self, collection_id: str, document_id: str) -> None:
        collection = self._collection(collection_id)
        collection.delete(where={"document_id": document_id})

    def count_chunks(self, collection_id: str = "default") -> int:
        return self._collection(collection_id).count()
    def close(self) -> None:
        client = getattr(self, "client", None)
        if client is None:
            return

        system = getattr(client, "_system", None)
        stop_method = getattr(system, "stop", None)
        if callable(stop_method):
            stop_method()

        self.client = None
