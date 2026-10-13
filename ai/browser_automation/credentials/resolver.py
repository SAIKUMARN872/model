"""Domain-aware credential resolution."""
from __future__ import annotations

from .vault import (
    CredentialAccessDeniedError,
    CredentialNotFoundError,
    CredentialRecord,
    CredentialSecret,
    CredentialValidationError,
    CredentialVault,
    normalize_domain,
)


class CredentialResolver:
    """Resolve a credential only for its registered domain and service."""

    def __init__(self, vault: CredentialVault) -> None:
        self._vault = vault
        self._records: dict[str, CredentialRecord] = {}

    def register(self, record: CredentialRecord) -> None:
        if not isinstance(record, CredentialRecord):
            raise CredentialValidationError("Invalid credential record.")
        reference = record.credential_id.strip()
        if not reference:
            raise CredentialValidationError("Invalid credential reference.")
        service = record.service.strip().lower()
        if not service:
            raise CredentialValidationError("Invalid service.")
        domain = normalize_domain(record.domain)
        self._records[reference] = CredentialRecord(
            credential_id=reference,
            service=service,
            domain=domain,
            username=record.username,
        )

    def resolve(
        self,
        reference: str,
        domain: str,
        *,
        authorized: bool = False,
    ) -> CredentialSecret:
        if authorized is not True:
            raise CredentialAccessDeniedError(
                "Credential access requires explicit authorization."
            )

        if not isinstance(reference, str) or not reference.strip():
            raise CredentialValidationError("Invalid credential reference.")

        normalized_domain = normalize_domain(domain)
        record = self._records.get(reference.strip())
        if record is None:
            raise CredentialNotFoundError("Credential not found.")

        if normalized_domain != record.domain:
            raise CredentialAccessDeniedError(
                "Credential is not authorized for this domain."
            )

        return self._vault.get(record.credential_id)

    def unregister(self, reference: str) -> bool:
        """Remove metadata. Secret deletion is managed by CredentialManager."""
        return self._records.pop(reference, None) is not None

    def get_record(self, reference: str) -> CredentialRecord:
        record = self._records.get(reference)
        if record is None:
            raise CredentialNotFoundError("Credential not found.")
        return record
