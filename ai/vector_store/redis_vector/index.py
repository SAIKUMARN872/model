import json
import struct

from .utils import (
    validate_index_name,
    validate_dimension,
    validate_vector,
    validate_metadata,
    validate_document_id,
)


class RedisVectorIndex:
    def __init__(
        self,
        client,
        index_name: str = "modelnow_vectors",
        *,
        key_prefix: str = "modelnow:doc:",
    ):
        self.client = client
        self.index_name = validate_index_name(index_name)
        if not isinstance(key_prefix, str) or not key_prefix:
            raise ValueError("key_prefix must be a non-empty string.")
        self.key_prefix = key_prefix
        self._dimension = None

    @staticmethod
    def _encode_vector(vector: list[float]) -> bytes:
        return struct.pack(f"<{len(vector)}f", *vector)

    @staticmethod
    def _decode_vector(value: bytes) -> list[float]:
        if not value or len(value) % 4:
            return []
        count = len(value) // 4
        return list(struct.unpack(f"<{count}f", value))

    def _key(self, document_id: str) -> str:
        return self.key_prefix + document_id

    def create(self, dimension: int, *, recreate: bool = False) -> bool:
        from redis.commands.search.field import TextField, TagField, VectorField
        from redis.commands.search.indexDefinition import IndexDefinition, IndexType
        from redis.exceptions import ResponseError

        dimension = validate_dimension(dimension)
        redis_client = self.client.ensure_connected()
        search = redis_client.ft(self.index_name)

        if recreate:
            try:
                search.dropindex(delete_documents=True)
            except ResponseError:
                pass

        fields = [
            TextField("document_id"),
            TextField("text"),
            TagField("metadata_source"),
            TextField("metadata_json"),
            VectorField(
                "embedding",
                "HNSW",
                {
                    "TYPE": "FLOAT32",
                    "DIM": dimension,
                    "DISTANCE_METRIC": "COSINE",
                    "M": 16,
                    "EF_CONSTRUCTION": 200,
                },
            ),
        ]

        try:
            search.create_index(
                fields,
                definition=IndexDefinition(
                    prefix=[self.key_prefix],
                    index_type=IndexType.HASH,
                ),
            )
        except ResponseError as exc:
            if "exist" in str(exc).lower() and not recreate:
                self._dimension = dimension
                return False
            raise

        self._dimension = dimension
        return True

    def upsert(
        self,
        document_id: str,
        text: str,
        vector,
        *,
        metadata: dict | None = None,
        dimension: int | None = None,
    ) -> str:
        document_id = validate_document_id(document_id)
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Document text must be a non-empty string.")

        expected_dimension = dimension or self._dimension
        vector = validate_vector(vector, expected_dimension)
        metadata = validate_metadata(metadata)
        if self._dimension is None:
            self._dimension = len(vector)
        if len(vector) != self._dimension:
            raise ValueError(f"Expected a vector with {self._dimension} dimensions.")

        source = metadata.get("source", "")
        if isinstance(source, (dict, list)):
            source = json.dumps(source, sort_keys=True)

        self.client.ensure_connected().hset(
            self._key(document_id),
            mapping={
                "document_id": document_id,
                "text": text,
                "metadata_source": str(source),
                "metadata_json": json.dumps(metadata, ensure_ascii=False),
                "embedding": self._encode_vector(vector),
            },
        )
        return document_id

    def fetch(self, document_id: str) -> dict | None:
        document_id = validate_document_id(document_id)
        record = self.client.ensure_connected().hgetall(self._key(document_id))
        if not record:
            return None

        decoded = {
            (key.decode() if isinstance(key, bytes) else key):
            (value.decode() if isinstance(value, bytes) and key != b"embedding" else value)
            for key, value in record.items()
        }
        metadata = json.loads(decoded.get("metadata_json", "{}"))
        vector = self._decode_vector(decoded.get("embedding", b""))

        return {
            "document_id": decoded.get("document_id", document_id),
            "text": decoded.get("text", ""),
            "metadata": metadata,
            "vector": vector,
        }

    def update(self, document_id: str, text: str, vector, *, metadata=None) -> bool:
        if self.fetch(document_id) is None:
            return False
        self.upsert(document_id, text, vector, metadata=metadata)
        return True

    def delete(self, document_ids: list[str]) -> int:
        ids = list(dict.fromkeys(validate_document_id(value) for value in document_ids))
        if not ids:
            return 0

        client = self.client.ensure_connected()
        keys = [self._key(document_id) for document_id in ids]
        return int(client.delete(*keys))

    def count(self) -> int:
        client = self.client.ensure_connected()
        cursor = 0
        total = 0
        while True:
            cursor, keys = client.scan(
                cursor=cursor,
                match=self.key_prefix + "*",
                count=500,
            )
            total += len(keys)
            if cursor == 0:
                break
        return total
