"""Repeatable performance benchmarks for embedding providers."""

import math
import statistics
import time

from .utils import validate_texts, validate_vectors


def _embed(provider, texts):
    if callable(provider):
        output = provider(texts)
    elif callable(getattr(provider, "embed_texts", None)):
        output = provider.embed_texts(texts)
    elif callable(getattr(provider, "embed", None)):
        output = provider.embed(texts)
    else:
        raise TypeError("Provider must be callable or implement embed_texts/embed.")
    return validate_vectors(output, "provider embeddings")


def benchmark_embeddings(provider, texts, repeats=3, warmup=1, batch_sizes=None):
    """Benchmark real provider calls; timings include provider-side work."""
    texts = validate_texts(texts)
    for name, value in (("repeats", repeats), ("warmup", warmup)):
        if isinstance(value, bool) or not isinstance(value, int) or value < (1 if name == "repeats" else 0):
            raise ValueError(f"{name} must be a valid non-negative integer.")
    batch_sizes = list(batch_sizes or [1, 8, 32])
    if not batch_sizes or any(isinstance(n, bool) or not isinstance(n, int) or n < 1 for n in batch_sizes):
        raise ValueError("batch_sizes must contain positive integers.")

    results = []
    for size in batch_sizes:
        sample = texts[:size]
        if not sample:
            continue
        for _ in range(warmup):
            _embed(provider, sample)
        durations = []
        dimensions = None
        for _ in range(repeats):
            start = time.perf_counter()
            vectors = _embed(provider, sample)
            elapsed = time.perf_counter() - start
            if len(vectors) != len(sample):
                raise ValueError("Provider returned a different number of vectors than inputs.")
            dimensions = len(vectors[0])
            durations.append(elapsed)
        mean_seconds = statistics.mean(durations)
        results.append({
            "batch_size": len(sample),
            "repeats": repeats,
            "mean_latency_seconds": mean_seconds,
            "median_latency_seconds": statistics.median(durations),
            "min_latency_seconds": min(durations),
            "max_latency_seconds": max(durations),
            "mean_latency_ms_per_text": mean_seconds * 1000 / len(sample),
            "throughput_texts_per_second": len(sample) / mean_seconds if mean_seconds else math.inf,
            "embedding_dimension": dimensions,
        })
    return {
        "benchmark": "embedding_provider",
        "text_count": len(texts),
        "results": results,
        "note": "Timing depends on hardware, model loading, device, and provider configuration.",
    }
