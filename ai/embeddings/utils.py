import math
from ai.embeddings.exceptions import EmbeddingValidationError, EmbeddingDimensionError

def validate_vector(vector):
    if not isinstance(vector, (list, tuple)) or not vector:
        raise EmbeddingValidationError("embedding vector must not be empty")
    try:
        values = [float(x) for x in vector]
    except (TypeError, ValueError) as exc:
        raise EmbeddingValidationError("embedding values must be numeric") from exc
    if not all(math.isfinite(x) for x in values):
        raise EmbeddingValidationError("embedding values must be finite")
    return values

def normalize_vector(vector):
    values = validate_vector(vector)
    norm = math.sqrt(sum(x * x for x in values))
    return values if norm == 0 else [x / norm for x in values]

def validate_embedding_batch(embeddings, expected_count=None):
    if not isinstance(embeddings, (list, tuple)):
        raise EmbeddingValidationError("embeddings must be a sequence")
    if expected_count is not None and len(embeddings) != expected_count:
        raise EmbeddingValidationError("embedding count does not match input count")
    vectors = [validate_vector(v) for v in embeddings]
    if vectors and len({len(v) for v in vectors}) != 1:
        raise EmbeddingDimensionError("embedding dimensions do not match")
    return vectors
