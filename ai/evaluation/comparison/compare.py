"""Compare benchmark results across models."""
from ai.evaluation.comparison.ranking import rank_models


def compare_models(results, weights=None):
    """Compare models from a benchmark result or a model-to-metrics mapping."""
    if not isinstance(results, dict) or not results:
        raise ValueError("results must be a non-empty dictionary")

    # Accept the output produced by ModelNow's benchmark module.
    model_results = results.get("models", results)
    if not isinstance(model_results, dict) or not model_results:
        raise ValueError("results must contain a non-empty models mapping")

    metrics_by_model = {}
    for name, entry in model_results.items():
        if not isinstance(name, str) or not name.strip():
            raise ValueError("model names must be non-empty strings")
        if not isinstance(entry, dict):
            raise ValueError(f"metrics for {name!r} must be a dictionary")
        metrics = entry.get("metrics", entry)
        if not isinstance(metrics, dict):
            raise ValueError(f"metrics for {name!r} must be a dictionary")
        metrics_by_model[name] = metrics

    return {
        "model_count": len(metrics_by_model),
        "ranking": rank_models(metrics_by_model, weights=weights),
    }


def best_model(results, weights=None):
    """Return the highest-ranked model, or None if no comparable metrics exist."""
    ranking = compare_models(results, weights=weights)["ranking"]
    return ranking[0] if ranking else None
