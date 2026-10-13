"""Validation helpers for embedding evaluation."""

import math
from collections.abc import Mapping, Sequence
from numbers import Real


def validate_vector(vector, name="vector"):
    if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
        raise ValueError(f"{name} must be a non-empty numeric sequence.")
    if not vector:
        raise ValueError(f"{name} cannot be empty.")
    result = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, Real):
            raise ValueError(f"{name} must contain only real numbers.")
        value = float(value)
        if not math.isfinite(value):
            raise ValueError(f"{name} must contain only finite values.")
        result.append(value)
    return result


def validate_vectors(vectors, name="vectors"):
    if isinstance(vectors, (str, bytes)) or not isinstance(vectors, Sequence):
        raise ValueError(f"{name} must be a sequence of vectors.")
    if not vectors:
        raise ValueError(f"{name} cannot be empty.")
    result = [validate_vector(v, f"{name}[{i}]") for i, v in enumerate(vectors)]
    dimension = len(result[0])
    if any(len(v) != dimension for v in result):
        raise ValueError(f"{name} must have consistent dimensions.")
    return result


def validate_k(k, collection_size=None):
    if isinstance(k, bool) or not isinstance(k, int) or k < 1:
        raise ValueError("k must be a positive integer.")
    if collection_size is not None and collection_size < 1:
        raise ValueError("collection_size must be positive.")
    return k


def validate_relevance(relevance):
    if isinstance(relevance, (str, bytes)) or not isinstance(relevance, Sequence):
        raise ValueError("relevance must be a sequence of non-negative numbers.")
    values = []
    for value in relevance:
        if isinstance(value, bool) or not isinstance(value, Real):
            raise ValueError("Relevance grades must be numeric.")
        value = float(value)
        if not math.isfinite(value) or value < 0:
            raise ValueError("Relevance grades must be finite and non-negative.")
        values.append(value)
    return values


def validate_texts(texts):
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise ValueError("texts must be a sequence of strings.")
    if not texts:
        raise ValueError("texts cannot be empty.")
    if any(not isinstance(t, str) or not t.strip() for t in texts):
        raise ValueError("Every text must be a non-empty string.")
    return list(texts)


def validate_similarity_pairs(pairs):
    if not isinstance(pairs, Sequence) or isinstance(pairs, (str, bytes)) or not pairs:
        raise ValueError("pairs must be a non-empty sequence.")
    result = []
    for i, pair in enumerate(pairs):
        if not isinstance(pair, Mapping):
            raise ValueError(f"pairs[{i}] must be a mapping.")
        if "left" not in pair or "right" not in pair or "score" not in pair:
            raise ValueError(f"pairs[{i}] needs left, right, and score.")
        left, right, score = pair["left"], pair["right"], pair["score"]
        if not isinstance(left, str) or not left.strip():
            raise ValueError(f"pairs[{i}].left must be non-empty text.")
        if not isinstance(right, str) or not right.strip():
            raise ValueError(f"pairs[{i}].right must be non-empty text.")
        if isinstance(score, bool) or not isinstance(score, Real):
            raise ValueError(f"pairs[{i}].score must be numeric.")
        score = float(score)
        if not math.isfinite(score):
            raise ValueError(f"pairs[{i}].score must be finite.")
        result.append({"left": left, "right": right, "score": score})
    return result
