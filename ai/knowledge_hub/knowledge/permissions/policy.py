from dataclasses import dataclass


@dataclass(frozen=True)
class AccessPolicy:
    principal_id: str
    collection_id: str
    permissions: tuple[str, ...] = ("read",)
