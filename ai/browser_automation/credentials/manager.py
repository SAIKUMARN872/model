"""Credential lifecycle manager for ModelNow browser automation."""
from __future__ import annotations

from .resolver import CredentialResolver
from .vault import (
    CredentialRecord,
    CredentialSecret,
    CredentialValidationError,
    CredentialVault,
    InMemoryCredentialVault,
    new_credential_reference,
    normalize_domain,
)


class CredentialManager:
    """Manage credential metadata and delegate secret storage to a vault.

    Authorization for retrieval must be explicitly granted by the caller.
    This class does not itself authenticate users or approve transactions.
    """

    def __init__(self, vault: CredentialVault | None = None) -> None:
        self._vault = vault if vault is not None else InMemoryCredentialVault()
        self._resolver = CredentialResolver(self._vault)

    def register(
        self,
        *,
        service: str,
        domain: str,
        username: str | None = None,
        password: str | None = None,
        api_key: str | None = None,
    ) -> CredentialRecord:
        if not isinstance(service, str) or not service.strip():
            raise CredentialValidationError("Invalid service.")
        normalized_domain = normalize_domain(domain)
        if username is not None and not isinstance(username, str):
            raise CredentialValidationError("Invalid username.")
        if password is not None and not isinstance(password, str):
            raise CredentialValidationError("Invalid password.")
        if api_key is not None and not isinstance(api_key, str):
            raise CredentialValidationError("Invalid API key.")
        if not any((username, password, api_key)):
            raise CredentialValidationError("At least one secret value is required.")

        reference = new_credential_reference()
        secret = CredentialSecret(
            username=username,
            password=password,
            api_key=api_key,
        )
        record = CredentialRecord(
            credential_id=reference,
            service=service.strip().lower(),
            domain=normalized_domain,
            username=username,
        )

        # Store the secret before exposing its metadata to the resolver.
        self._vault.put(reference, secret)
        try:
            self._resolver.register(record)
        except Exception:
            self._vault.delete(reference)
            raise
        return record

    def get(
        self,
        reference: str,
        *,
        domain: str,
        authorized: bool = False,
    ) -> CredentialSecret:
        return self._resolver.resolve(
            reference,
            domain,
            authorized=authorized,
        )

    def update(
        self,
        reference: str,
        *,
        domain: str,
        authorized: bool = False,
        username: str | None = None,
        password: str | None = None,
        api_key: str | None = None,
    ) -> CredentialRecord:
        if authorized is not True:
            from .vault import CredentialAccessDeniedError
            raise CredentialAccessDeniedError(
                "Credential update requires explicit authorization."
            )

        existing = self._resolver.get_record(reference)
        if normalize_domain(domain) != existing.domain:
            from .vault import CredentialAccessDeniedError
            raise CredentialAccessDeniedError(
                "Credential is not authorized for this domain."
            )

        old = self._vault.get(reference)
        secret = CredentialSecret(
            username=old.username if username is None else username,
            password=old.password if password is None else password,
            api_key=old.api_key if api_key is None else api_key,
        )
        if not any((secret.username, secret.password, secret.api_key)):
            raise CredentialValidationError("Credential secret is empty.")

        self._vault.put(reference, secret)
        record = CredentialRecord(
            credential_id=reference,
            service=existing.service,
            domain=existing.domain,
            username=secret.username,
        )
        self._resolver.register(record)
        return record

    def delete(
        self,
        reference: str,
        *,
        authorized: bool = False,
    ) -> bool:
        if authorized is not True:
            from .vault import CredentialAccessDeniedError
            raise CredentialAccessDeniedError(
                "Credential deletion requires explicit authorization."
            )

        # Remove metadata first so the reference can no longer be resolved.
        self._resolver.unregister(reference)
        return self._vault.delete(reference)

    def metadata(self, reference: str) -> CredentialRecord:
        """Return safe metadata without retrieving secret values."""
        return self._resolver.get_record(reference)


__all__ = ["CredentialManager"]
