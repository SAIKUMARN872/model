"""Credential storage abstractions for ModelNow browser automation."""
from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Protocol
from uuid import uuid4


class CredentialError(Exception):
    """Base exception for credential operations."""


class CredentialNotFoundError(CredentialError):
    """Raised when a credential reference cannot be resolved."""


class CredentialAccessDeniedError(CredentialError):
    """Raised when credential access is not explicitly authorized."""


class CredentialValidationError(CredentialError):
    """Raised when credential metadata or values are invalid."""


def _required_text(value: str, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CredentialValidationError(f"Invalid {field}.")
    return value.strip()


def normalize_domain(domain: str) -> str:
    """Normalize a hostname; callers must supply a hostname, not a URL."""
    domain = _required_text(domain, "domain").lower().rstrip(".")
    if (
        "://" in domain
        or "/" in domain
        or ":" in domain
        or "@" in domain
        or any(ch.isspace() for ch in domain)
        or not domain
    ):
        raise CredentialValidationError("Invalid domain.")
    return domain


@dataclass(frozen=True, slots=True)
class CredentialRecord:
    credential_id: str
    service: str
    domain: str
    username: str | None = None


@dataclass(frozen=True, slots=True)
class CredentialSecret:
    """Secret material. Never log or serialize this object."""
    username: str | None
    password: str | None
    api_key: str | None = None


class CredentialVault(Protocol):
    """Storage contract implemented by development and production vaults."""

    def put(self, reference: str, secret: CredentialSecret) -> None: ...
    def get(self, reference: str) -> CredentialSecret: ...
    def delete(self, reference: str) -> bool: ...


class InMemoryCredentialVault:
    """Development/test backend; data is lost when the process exits.

    This backend is NOT encrypted or suitable for production credentials.
    """

    def __init__(self) -> None:
        self._secrets: dict[str, CredentialSecret] = {}
        self._lock = RLock()

    def put(self, reference: str, secret: CredentialSecret) -> None:
        reference = _required_text(reference, "credential reference")
        if not isinstance(secret, CredentialSecret):
            raise CredentialValidationError("Invalid credential secret.")
        if not any((secret.username, secret.password, secret.api_key)):
            raise CredentialValidationError("Credential secret is empty.")
        with self._lock:
            self._secrets[reference] = secret

    def get(self, reference: str) -> CredentialSecret:
        reference = _required_text(reference, "credential reference")
        with self._lock:
            secret = self._secrets.get(reference)
        if secret is None:
            raise CredentialNotFoundError("Credential not found.")
        return secret

    def delete(self, reference: str) -> bool:
        reference = _required_text(reference, "credential reference")
        with self._lock:
            return self._secrets.pop(reference, None) is not None

    def clear(self) -> None:
        """Clear development/test secrets."""
        with self._lock:
            self._secrets.clear()


def new_credential_reference() -> str:
    """Generate an opaque reference; it contains no secret material."""
    return f"cred_{uuid4().hex}"
