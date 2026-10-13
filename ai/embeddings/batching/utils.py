from ai.embeddings.exceptions import EmbeddingValidationError


def validate_batch_size(batch_size: int, maximum: int = 512) -> int:
    if isinstance(batch_size, bool) or not isinstance(batch_size, int):
        raise EmbeddingValidationError("batch_size must be an integer")
    if isinstance(maximum, bool) or not isinstance(maximum, int):
        raise EmbeddingValidationError("maximum must be an integer")
    if maximum < 1 or batch_size < 1 or batch_size > maximum:
        raise EmbeddingValidationError(
            f"batch_size must be between 1 and {maximum}"
        )
    return batch_size


def estimate_batches(item_count: int, batch_size: int) -> int:
    validate_batch_size(batch_size)

    if isinstance(item_count, bool) or not isinstance(item_count, int):
        raise EmbeddingValidationError("item_count must be an integer")
    if item_count < 0:
        raise EmbeddingValidationError("item_count cannot be negative")

    return (item_count + batch_size - 1) // batch_size
