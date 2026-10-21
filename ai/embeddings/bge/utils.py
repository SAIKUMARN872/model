from collections.abc import Sequence

from ai.embeddings.exceptions import EmbeddingValidationError
from .models import BGE_QUERY_INSTRUCTION


def prepare_passages(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise EmbeddingValidationError(
            "Passages must be a sequence of strings"
        )

    if not texts:
        raise EmbeddingValidationError("Passages must not be empty")

    result = []
    for index, text in enumerate(texts):
        if not isinstance(text, str) or not text.strip():
            raise EmbeddingValidationError(
                f"Passage at index {index} must be a non-empty string"
            )
        result.append(text.strip())

    return result


def prepare_queries(texts: Sequence[str]) -> list[str]:
    queries = prepare_passages(texts)
    return [
        text if text.startswith(BGE_QUERY_INSTRUCTION)
        else BGE_QUERY_INSTRUCTION + text
        for text in queries
    ]
