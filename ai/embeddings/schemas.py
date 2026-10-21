from collections.abc import Sequence
from ai.embeddings.exceptions import EmbeddingValidationError

def validate_texts(texts):
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise EmbeddingValidationError("texts must be a sequence of strings")
    if not texts:
        raise EmbeddingValidationError("texts must not be empty")
    if any(not isinstance(t, str) or not t.strip() for t in texts):
        raise EmbeddingValidationError("each text must be a non-empty string")
    return list(texts)
