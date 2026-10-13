"""MongoDB connector configuration."""

from dataclasses import dataclass
from urllib.parse import urlsplit


@dataclass(frozen=True, slots=True)
class MongoDBConfig:
    uri_env_var: str = "MONGODB_URI"
    database: str = ""
    timeout_seconds: float = 10.0
    max_documents: int = 100
    required_permissions: tuple[str, ...] = ("mongodb:read",)

    def __post_init__(self):
        if not self.uri_env_var or not self.uri_env_var.replace("_", "").isalnum():
            raise ValueError("uri_env_var must be an environment variable name")
        if not self.database or not self.database.strip():
            raise ValueError("database is required")
        if any(c in self.database for c in "/\\.$ "):
            raise ValueError("database name is invalid")
        if not 0 < self.timeout_seconds <= 120:
            raise ValueError("timeout_seconds must be in (0, 120]")
        if not 1 <= self.max_documents <= 100:
            raise ValueError("max_documents must be from 1 to 100")
        if not self.required_permissions:
            raise ValueError("required_permissions cannot be empty")


def validate_mongodb_uri(uri):
    if not isinstance(uri, str) or not uri.strip():
        raise ValueError("MongoDB URI is missing")
    parsed = urlsplit(uri)
    if parsed.scheme not in ("mongodb", "mongodb+srv"):
        raise ValueError("MongoDB URI must use mongodb or mongodb+srv")
    if not parsed.hostname:
        raise ValueError("MongoDB URI must specify a host")
    if parsed.query and any(
        item.lower().startswith(("tlsallowinvalidcertificates=", "tlsinsecure="))
        and item.split("=", 1)[1].lower() == "true"
        for item in parsed.query.split("&")
    ):
        raise ValueError("Insecure TLS options are not allowed")
    return uri


def create_mongodb_config(
    database,
    *,
    uri_env_var="MONGODB_URI",
    timeout_seconds=10.0,
    max_documents=100,
):
    return MongoDBConfig(
        uri_env_var=uri_env_var,
        database=database,
        timeout_seconds=timeout_seconds,
        max_documents=max_documents,
    )
