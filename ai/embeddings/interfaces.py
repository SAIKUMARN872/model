from typing import Protocol, Sequence, runtime_checkable

@runtime_checkable
class EmbeddingProvider(Protocol):
    @property
    def model_name(self) -> str: ...

    def embed(self, texts: Sequence[str]) -> list[list[float]]: ...
