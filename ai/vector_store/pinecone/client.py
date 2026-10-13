import os

from .utils import validate_index_name, validate_dimension


class PineconeClient:
    def __init__(
        self,
        api_key: str | None = None,
        *,
        index_name: str | None = None,
        host: str | None = None,
    ) -> None:
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        configured_index = index_name or os.getenv("PINECONE_INDEX_NAME")
        self.index_name = (
            validate_index_name(configured_index) if configured_index else None
        )
        self.host = host or os.getenv("PINECONE_HOST")
        self._client = None
        self._index_cache = {}

    @property
    def initialized(self) -> bool:
        return self._client is not None

    def connect(self):
        if self._client is not None:
            return self._client
        if not self.api_key:
            raise RuntimeError(
                "Set PINECONE_API_KEY before connecting to Pinecone."
            )
        try:
            from pinecone import Pinecone
        except ImportError as exc:
            raise RuntimeError(
                "Install the Pinecone SDK with: pip install pinecone"
            ) from exc

        try:
            self._client = Pinecone(api_key=self.api_key)
            return self._client
        except Exception as exc:
            raise ConnectionError(f"Could not initialize Pinecone: {exc}") from exc

    def ensure_connected(self):
        return self.connect()

    def get_index(self, index_name: str | None = None):
        name = validate_index_name(index_name or self.index_name or "")
        if name not in self._index_cache:
            client = self.ensure_connected()
            try:
                if self.host and name == self.index_name:
                    self._index_cache[name] = client.Index(host=self.host)
                else:
                    self._index_cache[name] = client.Index(name)
            except Exception as exc:
                raise ConnectionError(f"Could not open Pinecone index '{name}': {exc}") from exc
        return self._index_cache[name]

    def list_indexes(self) -> list[str]:
        client = self.ensure_connected()
        response = client.list_indexes()
        indexes = getattr(response, "indexes", None)
        if indexes is None and isinstance(response, dict):
            indexes = response.get("indexes", [])
        result = []
        for item in indexes or []:
            name = item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
            if name:
                result.append(name)
        return result

    def create_index(
        self,
        index_name: str,
        dimension: int,
        *,
        metric: str = "cosine",
        cloud: str = "aws",
        region: str = "us-east-1",
    ):
        name = validate_index_name(index_name)
        dimension = validate_dimension(dimension)
        if metric not in {"cosine", "dotproduct", "euclidean"}:
            raise ValueError("Unsupported Pinecone similarity metric.")
        client = self.ensure_connected()
        try:
            existing = self.list_indexes()
            if name in existing:
                return client.Index(name)
            from pinecone import ServerlessSpec
            client.create_index(
                name=name,
                dimension=dimension,
                metric=metric,
                spec=ServerlessSpec(cloud=cloud, region=region),
            )
            return client.Index(name)
        except Exception as exc:
            raise RuntimeError(f"Could not create Pinecone index '{name}': {exc}") from exc

    def delete_index(self, index_name: str) -> bool:
        name = validate_index_name(index_name)
        client = self.ensure_connected()
        if name not in self.list_indexes():
            return False
        client.delete_index(name)
        self._index_cache.pop(name, None)
        return True

    def close(self) -> None:
        self._index_cache.clear()
        self._client = None
