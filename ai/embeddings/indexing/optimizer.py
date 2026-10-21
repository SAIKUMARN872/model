"""Index optimization helpers."""

from collections.abc import Sequence
import math


class EmbeddingIndexOptimizer:
    """Validate and prepare vector batches for index ingestion."""

    @staticmethod
    def normalize_vectors(vectors: Sequence[Sequence[float]]) -> list[list[float]]:
        result = []
        dimension = None

        for row in vectors:
            if isinstance(row, (str, bytes)) or not isinstance(row, Sequence):
                raise TypeError("Each vector must be a sequence")
            values = []
            for value in row:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise TypeError("Vector values must be numeric")
                number = float(value)
                if not math.isfinite(number):
                    raise ValueError("Vector values must be finite")
                values.append(number)

            if not values:
                raise ValueError("Vectors cannot be empty")
            if dimension is None:
                dimension = len(values)
            elif len(values) != dimension:
                raise ValueError("Vector dimensions must match")

            norm = math.sqrt(sum(value * value for value in values))
            if norm == 0:
                raise ValueError("Cannot normalize a zero vector")
            result.append([value / norm for value in values])

        return result

    @staticmethod
    def batch_indices(count: int, batch_size: int = 256) -> list[tuple[int, int]]:
        if isinstance(count, bool) or not isinstance(count, int) or count < 0:
            raise ValueError("count must be a non-negative integer")
        if isinstance(batch_size, bool) or not isinstance(batch_size, int):
            raise TypeError("batch_size must be an integer")
        if batch_size < 1:
            raise ValueError("batch_size must be positive")

        return [
            (start, min(start + batch_size, count))
            for start in range(0, count, batch_size)
        ]

    @staticmethod
    def estimate_memory_bytes(count: int, dimension: int, bytes_per_value: int = 4) -> int:
        for name, value in (
            ("count", count),
            ("dimension", dimension),
            ("bytes_per_value", bytes_per_value),
        ):
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise ValueError(f"{name} must be a non-negative integer")
        return count * dimension * bytes_per_value
