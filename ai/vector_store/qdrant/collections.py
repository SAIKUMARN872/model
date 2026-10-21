import uuid

from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_vector,
    validate_metadata,
    validate_document_id,
)


class QdrantCollectionManager:
    def __init__(self, client):
        self.client = client

    @staticmethod
    def _point_id(document_id: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_URL, "modelnow:" + document_id))

    def create(self, collection_name: str, dimension: int, *, recreate: bool = False):
        from qdrant_client.models import Distance, VectorParams

        name = validate_collection_name(collection_name)
        dimension = validate_dimension(dimension)
        client = self.client.ensure_connected()

        if client.collection_exists(name):
            if not recreate:
                return False
            client.delete_collection(name)

        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=dimension, distance=Distance.COSINE),
        )
        return True

    def upsert(self, collection_name: str, documents: list, *, dimension: int):
        from qdrant_client.models import PointStruct

        name = validate_collection_name(collection_name)
        dimension = validate_dimension(dimension)
        if not documents:
            return 0

        points = []
        seen = set()
        for document in documents:
            document_id = validate_document_id(document.document_id)
            if document_id in seen:
                raise ValueError(f"Duplicate document ID: {document_id}")
            seen.add(document_id)

            text = document.text
            if not isinstance(text, str) or not text.strip():
                raise ValueError("Document text must be a non-empty string.")

            vector = validate_vector(document.embedding, dimension)
            metadata = validate_metadata(document.metadata)
            points.append(
                PointStruct(
                    id=self._point_id(document_id),
                    vector=vector,
                    payload={
                        "document_id": document_id,
                        "text": text,
                        "metadata": metadata,
                    },
                )
            )

        self.client.ensure_connected().upsert(
            collection_name=name,
            points=points,
            wait=True,
        )
        return len(points)

    def get_document(self, collection_name: str, document_id: str):
        name = validate_collection_name(collection_name)
        document_id = validate_document_id(document_id)
        result = self.client.ensure_connected().retrieve(
            collection_name=name,
            ids=[self._point_id(document_id)],
            with_payload=True,
            with_vectors=True,
        )
        if not result:
            return None

        point = result[0]
        payload = point.payload or {}
        from ..models import VectorDocument

        return VectorDocument(
            document_id=payload.get("document_id", document_id),
            text=payload.get("text", ""),
            metadata=payload.get("metadata") or {},
            embedding=list(point.vector) if point.vector is not None else None,
        )

    def update_document(self, collection_name: str, document, *, dimension: int) -> bool:
        existing = self.get_document(collection_name, document.document_id)
        if existing is None:
            return False
        self.upsert(collection_name, [document], dimension=dimension)
        return True

    def delete_documents(self, collection_name: str, document_ids: list[str]) -> int:
        from qdrant_client.models import PointIdsList

        name = validate_collection_name(collection_name)
        ids = list(dict.fromkeys(validate_document_id(value) for value in document_ids))
        if not ids:
            return 0

        client = self.client.ensure_connected()
        existing = client.retrieve(
            collection_name=name,
            ids=[self._point_id(value) for value in ids],
            with_payload=False,
            with_vectors=False,
        )
        if existing:
            client.delete(
                collection_name=name,
                points_selector=PointIdsList(
                    points=[point.id for point in existing]
                ),
                wait=True,
            )
        return len(existing)

    def count(self, collection_name: str) -> int:
        name = validate_collection_name(collection_name)
        result = self.client.ensure_connected().count(
            collection_name=name,
            exact=True,
        )
        return int(result.count)
