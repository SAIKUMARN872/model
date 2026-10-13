"""Secure in-memory storage for opaque MCP access tokens."""
from dataclasses import dataclass
import hashlib
import secrets
import threading
import time


@dataclass(frozen=True)
class TokenRecord:
    subject: str
    scopes: frozenset[str]
    expires_at: float
    issued_at: float


class TokenStore:
    """Store token hashes rather than raw bearer tokens.

    This store is process-local. Production deployments needing persistence
    or multi-worker revocation should use a shared secure token backend.
    """

    def __init__(self, *, default_ttl_seconds: int = 3600,
                 max_ttl_seconds: int = 86400):
        if default_ttl_seconds <= 0 or max_ttl_seconds <= 0:
            raise ValueError("Token lifetimes must be positive")
        if default_ttl_seconds > max_ttl_seconds:
            raise ValueError("Default TTL cannot exceed maximum TTL")
        self.default_ttl_seconds = default_ttl_seconds
        self.max_ttl_seconds = max_ttl_seconds
        self._records: dict[str, TokenRecord] = {}
        self._lock = threading.RLock()

    @staticmethod
    def _digest(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def issue(self, subject: str, scopes=(), *, ttl_seconds=None):
        if not isinstance(subject, str) or not subject.strip():
            raise ValueError("Token subject must be a non-empty string")

        ttl = self.default_ttl_seconds if ttl_seconds is None else ttl_seconds
        if isinstance(ttl, bool) or not isinstance(ttl, int):
            raise TypeError("Token TTL must be an integer")
        if ttl <= 0 or ttl > self.max_ttl_seconds:
            raise ValueError("Token TTL is outside the allowed range")

        if isinstance(scopes, str):
            raise TypeError("Scopes must be an iterable of scope strings")
        normalized_scopes = frozenset(scopes)
        if any(not isinstance(scope, str) or not scope.strip()
               for scope in normalized_scopes):
            raise ValueError("Scopes must be non-empty strings")

        now = time.time()
        token = secrets.token_urlsafe(32)
        record = TokenRecord(
            subject=subject.strip(),
            scopes=normalized_scopes,
            issued_at=now,
            expires_at=now + ttl,
        )
        with self._lock:
            self._records[self._digest(token)] = record
        return token

    def validate(self, token: str) -> TokenRecord | None:
        if not isinstance(token, str) or not token:
            return None
        digest = self._digest(token)
        now = time.time()
        with self._lock:
            record = self._records.get(digest)
            if record is None:
                return None
            if record.expires_at <= now:
                self._records.pop(digest, None)
                return None
            return record

    def revoke(self, token: str) -> bool:
        if not isinstance(token, str) or not token:
            return False
        with self._lock:
            return self._records.pop(self._digest(token), None) is not None

    def purge_expired(self) -> int:
        now = time.time()
        with self._lock:
            expired = [
                digest for digest, record in self._records.items()
                if record.expires_at <= now
            ]
            for digest in expired:
                self._records.pop(digest, None)
            return len(expired)
