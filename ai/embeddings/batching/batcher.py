from collections.abc import Sequence

from ai.embeddings.constants import DEFAULT_BATCH_SIZE, MAX_BATCH_SIZE
from ai.embeddings.exceptions import EmbeddingValidationError


class EmbeddingBatcher:
    """Split text inputs into bounded batches while preserving order."""

    def __init__(
        self,
        batch_size: int = DEFAULT_BATCH_SIZE,
        max_batch_size: int = MAX_BATCH_SIZE,
    ) -> None:
        if isinstance(batch_size, bool) or not isinstance(batch_size, int):
            raise EmbeddingValidationError("batch_size must be an integer")
        if isinstance(max_batch_size, bool) or not isinstance(max_batch_size, int):
            raise EmbeddingValidationError("max_batch_size must be an integer")
        if batch_size < 1:
            raise EmbeddingValidationError("batch_size must be positive")
        if max_batch_size < 1 or batch_size > max_batch_size:
            raise EmbeddingValidationError(
                "batch_size must be between 1 and max_batch_size"
            )

        self.batch_size = batch_size
        self.max_batch_size = max_batch_size

    def split(self, texts: Sequence[str]) -> list[list[str]]:
        if isinstance(texts, (str, bytes)):
            raise EmbeddingValidationError(
                "texts must be a sequence, not a single string"
            )

        values = list(texts)

        for index, text in enumerate(values):
            if not isinstance(text, str) or not text.strip():
                raise EmbeddingValidationError(
                    f"text at index {index} must be a non-empty string"
                )

        return [
            values[start : start + self.batch_size]
            for start in range(0, len(values), self.batch_size)
        ]

    def count_batches(self, item_count: int) -> int:
        if isinstance(item_count, bool) or not isinstance(item_count, int):
            raise EmbeddingValidationError("item_count must be an integer")
        if item_count < 0:
            raise EmbeddingValidationError("item_count cannot be negative")
        if item_count == 0:
            return 0
        return (item_count + self.batch_size - 1) // self.batch_size
