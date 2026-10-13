import os


class QdrantClient:
    def __init__(
        self,
        url: str | None = None,
        api_key: str | None = None,
        *,
        timeout: float = 10.0,
        prefer_grpc: bool = False,
        client=None,
    ):
        if timeout <= 0:
            raise ValueError("timeout must be positive.")

        self.url = url or os.getenv("QDRANT_URL", "http://localhost:6333")
        self.api_key = api_key or os.getenv("QDRANT_API_KEY")
        self.timeout = timeout
        self.prefer_grpc = prefer_grpc
        self._client = client

    @property
    def initialized(self) -> bool:
        return self._client is not None

    def connect(self):
        if self._client is not None:
            return self._client

        try:
            from qdrant_client import QdrantClient as SDKQdrantClient
        except ImportError as exc:
            raise RuntimeError(
                "Install Qdrant support with: pip install qdrant-client"
            ) from exc

        try:
            self._client = SDKQdrantClient(
                url=self.url,
                api_key=self.api_key,
                timeout=self.timeout,
                prefer_grpc=self.prefer_grpc,
            )
            return self._client
        except Exception as exc:
            self._client = None
            raise ConnectionError(f"Could not initialize Qdrant client: {exc}") from exc

    def ensure_connected(self):
        return self.connect()

    def list_collections(self) -> list[str]:
        response = self.ensure_connected().get_collections()
        return [collection.name for collection in response.collections]

    def collection_exists(self, collection_name: str) -> bool:
        from .utils import validate_collection_name

        name = validate_collection_name(collection_name)
        return bool(self.ensure_connected().collection_exists(name))

    def delete_collection(self, collection_name: str) -> bool:
        from .utils import validate_collection_name

        name = validate_collection_name(collection_name)
        if not self.collection_exists(name):
            return False
        return bool(self.ensure_connected().delete_collection(name))

    def close(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            finally:
                self._client = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()
        return False
