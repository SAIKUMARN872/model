import math
from collections.abc import Sequence


def validate_texts(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings.")
    result = list(texts)
    for index, text in enumerate(result):
        if not isinstance(text, str):
            raise TypeError(f"texts[{index}] must be a string.")
        if not text.strip():
            raise ValueError(f"texts[{index}] must not be blank.")
    return result


def prepare_passages(texts: Sequence[str]) -> list[str]:
    return [
        text if text.lstrip().lower().startswith("passage:") else f"passage: {text}"
        for text in validate_texts(texts)
    ]


def prepare_queries(texts: Sequence[str]) -> list[str]:
    return [
        text if text.lstrip().lower().startswith("query:") else f"query: {text}"
        for text in validate_texts(texts)
    ]


def validate_embeddings(embeddings, expected_count: int, expected_dimension: int | None = None):
    try:
        rows = embeddings.tolist() if hasattr(embeddings, "tolist") else list(embeddings)
    except (TypeError, ValueError) as exc:
        raise ValueError("Expected a two-dimensional embedding batch.") from exc

    if len(rows) != expected_count:
        raise ValueError(f"Expected {expected_count} vectors, received {len(rows)}.")

    result = []
    dimension = expected_dimension

    for index, row in enumerate(rows):
        if hasattr(row, "tolist"):
            row = row.tolist()
        if not isinstance(row, (list, tuple)) or not row:
            raise ValueError(f"Embedding {index} must be a non-empty vector.")

        vector = []
        for value in row:
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError("Embedding values must be numeric.")
            value = float(value)
            if not math.isfinite(value):
                raise ValueError("Embedding values must be finite.")
            vector.append(value)

        if dimension is None:
            dimension = len(vector)
        if len(vector) != dimension:
            raise ValueError("Embedding dimensions do not match.")
        result.append(vector)

    return result
