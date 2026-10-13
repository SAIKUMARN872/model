import json

from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_embedding,
    validate_metadata,
    validate_document_id,
    quote_identifier,
)
from ..models import VectorDocument, VectorCollectionInfo


class PgVectorSchema:
    def __init__(self, client, collection_name: str, dimension: int):
        self.client = client
        self.collection_name = validate_collection_name(collection_name)
        self.dimension = validate_dimension(dimension)
        self.table = (
            f"{quote_identifier(client.schema)}."
            f"{quote_identifier(self.collection_name)}"
        )

    def create(self) -> None:
        self.client.create_collection(self.collection_name, self.dimension)

    def add_documents(self, documents: list[VectorDocument]) -> int:
        if not documents:
            return 0

        connection = self.client.ensure_connected()
        rows = []
        seen_ids = set()

        for document in documents:
            document_id = validate_document_id(document.document_id)
            if document_id in seen_ids:
                raise ValueError(f"Duplicate document ID in batch: {document_id}")
            seen_ids.add(document_id)

            text = document.text
            if not isinstance(text, str) or not text.strip():
                raise ValueError("Document text must be a non-empty string.")

            embedding = validate_embedding(document.embedding, self.dimension)
            metadata = validate_metadata(document.metadata)
            rows.append(
                (
                    document_id,
                    text,
                    "[" + ",".join(map(str, embedding)) + "]",
                    json.dumps(metadata),
                )
            )

        try:
            with connection.cursor() as cursor:
                cursor.executemany(
                    f"""
                    INSERT INTO {self.table}
                        (document_id, text, embedding, metadata)
                    VALUES (%s, %s, %s::vector, %s::jsonb)
                    ON CONFLICT (document_id) DO UPDATE SET
                        text = EXCLUDED.text,
                        embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata,
                        updated_at = NOW()
                    """,
                    rows,
                )
            connection.commit()
            return len(rows)
        except Exception:
            connection.rollback()
            raise

    def get_document(self, document_id: str) -> VectorDocument | None:
        document_id = validate_document_id(document_id)
        connection = self.client.ensure_connected()
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT document_id, text, metadata, embedding::text
                FROM {self.table}
                WHERE document_id = %s
                """,
                (document_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        embedding_text = row[3].strip("[]")
        embedding = [float(value) for value in embedding_text.split(",")] if embedding_text else []
        return VectorDocument(
            document_id=row[0],
            text=row[1],
            metadata=row[2] or {},
            embedding=embedding,
        )

    def update_document(self, document: VectorDocument) -> bool:
        if self.get_document(document.document_id) is None:
            return False
        return self.add_documents([document]) == 1

    def delete_documents(self, document_ids: list[str]) -> int:
        ids = list(dict.fromkeys(validate_document_id(value) for value in document_ids))
        if not ids:
            return 0

        connection = self.client.ensure_connected()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"DELETE FROM {self.table} WHERE document_id = ANY(%s)",
                    (ids,),
                )
                deleted = cursor.rowcount
            connection.commit()
            return deleted
        except Exception:
            connection.rollback()
            raise

    def count(self) -> int:
        connection = self.client.ensure_connected()
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) FROM {self.table}")
            return int(cursor.fetchone()[0])

    def info(self) -> VectorCollectionInfo:
        return VectorCollectionInfo(
            name=self.collection_name,
            count=self.count(),
            metadata={"backend": "pgvector", "dimension": self.dimension},
        )
