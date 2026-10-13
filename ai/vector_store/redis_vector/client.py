import os


class RedisVectorClient:
    def __init__(
        self,
        url: str | None = None,
        *,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        username: str | None = None,
        password: str | None = None,
        socket_timeout: float = 5.0,
        client=None,
    ):
        if socket_timeout <= 0:
            raise ValueError("socket_timeout must be positive.")

        self.url = url or os.getenv("REDIS_URL")
        self.host = host
        self.port = port
        self.db = db
        self.username = username or os.getenv("REDIS_USERNAME")
        self.password = password or os.getenv("REDIS_PASSWORD")
        self.socket_timeout = socket_timeout
        self._client = client

    @property
    def initialized(self) -> bool:
        return self._client is not None

    def connect(self):
        if self._client is not None:
            return self._client

        try:
            import redis
        except ImportError as exc:
            raise RuntimeError(
                "Install Redis support with: pip install 'redis>=5.0'"
            ) from exc

        try:
            if self.url:
                self._client = redis.Redis.from_url(
                    self.url,
                    socket_timeout=self.socket_timeout,
                    decode_responses=False,
                )
            else:
                self._client = redis.Redis(
                    host=self.host,
                    port=self.port,
                    db=self.db,
                    username=self.username,
                    password=self.password,
                    socket_timeout=self.socket_timeout,
                    decode_responses=False,
                )
            return self._client
        except Exception as exc:
            self._client = None
            raise ConnectionError(f"Could not initialize Redis client: {exc}") from exc

    def ensure_connected(self):
        return self.connect()

    def ping(self) -> bool:
        return bool(self.ensure_connected().ping())

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
