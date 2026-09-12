"""
Embedding similarity package.
"""

from .cosine import (
    cosine_similarity,
)

from .dot_product import (
    dot_product,
    dot_product_similarity,
)

from .euclidean import (
    euclidean_distance,
    euclidean_similarity,
    squared_euclidean_distance,
)

from .utils import (
    distance_to_similarity,
    normalize_vector,
    normalize_vectors,
    similarity_to_distance,
    validate_metric,
    validate_pair,
    validate_vector,
    vector_norm,
)


__all__ = [
    "cosine_similarity",
    "dot_product",
    "dot_product_similarity",
    "euclidean_distance",
    "euclidean_similarity",
    "squared_euclidean_distance",
    "validate_vector",
    "validate_pair",
    "validate_metric",
    "vector_norm",
    "normalize_vector",
    "normalize_vectors",
    "similarity_to_distance",
    "distance_to_similarity",
]


__version__ = "1.0.0"