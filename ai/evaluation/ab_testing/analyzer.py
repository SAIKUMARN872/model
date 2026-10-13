"""Analyze quality, cost, latency, and statistical uncertainty."""
import math
from statistics import NormalDist, mean, stdev

from ai.evaluation.ab_testing.experiment import Experiment
from ai.evaluation.ab_testing.variant import Variant


SUPPORTED_METRICS = {"quality_score", "cost_usd", "latency_ms"}


def _finite_number(value, field_name):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field_name} must be numeric")
    if not math.isfinite(value):
        raise ValueError(f"{field_name} must be finite")
    return float(value)


def _metric_values(variant, metric):
    values = []
    for index, observation in enumerate(variant.observations):
        if metric not in observation:
            continue
        value = _finite_number(observation[metric], f"{metric} at observation {index}")
        if metric == "quality_score" and not 0 <= value <= 1:
            raise ValueError("quality_score values must be between 0 and 1")
        if metric in {"cost_usd", "latency_ms"} and value < 0:
            raise ValueError(f"{metric} values must be nonnegative")
        values.append(value)
    return values


def _summary(values):
    if not values:
        return {
            "sample_count": 0,
            "mean": None,
            "standard_deviation": None,
            "standard_error": None,
            "confidence_interval_95": None,
        }
    average = mean(values)
    if len(values) < 2:
        return {
            "sample_count": len(values),
            "mean": average,
            "standard_deviation": None,
            "standard_error": None,
            "confidence_interval_95": None,
        }
    sd = stdev(values)
    se = sd / math.sqrt(len(values))
    margin = NormalDist().inv_cdf(0.975) * se
    return {
        "sample_count": len(values),
        "mean": average,
        "standard_deviation": sd,
        "standard_error": se,
        "confidence_interval_95": [average - margin, average + margin],
    }


class ABTestAnalyzer:
    """Analyze two variants; higher quality is better, lower cost/latency is better."""

    def analyze(self, experiment: Experiment, control: Variant, candidate: Variant):
        if not isinstance(experiment, Experiment):
            raise ValueError("experiment must be an Experiment")
        if not isinstance(control, Variant) or not isinstance(candidate, Variant):
            raise ValueError("control and candidate must be Variant objects")
        if control.name != experiment.control_name:
            raise ValueError("control variant does not match experiment configuration")
        if candidate.name != experiment.candidate_name:
            raise ValueError("candidate variant does not match experiment configuration")
        if experiment.primary_metric not in SUPPORTED_METRICS:
            raise ValueError(f"unsupported primary_metric: {experiment.primary_metric}")

        metrics = {}
        for metric in sorted(SUPPORTED_METRICS):
            control_values = _metric_values(control, metric)
            candidate_values = _metric_values(candidate, metric)
            control_summary = _summary(control_values)
            candidate_summary = _summary(candidate_values)

            difference = None
            relative_change_percent = None
            if control_summary["mean"] is not None and candidate_summary["mean"] is not None:
                difference = candidate_summary["mean"] - control_summary["mean"]
                if control_summary["mean"] != 0:
                    relative_change_percent = difference / abs(control_summary["mean"]) * 100.0

            metrics[metric] = {
                "control": control_summary,
                "candidate": candidate_summary,
                "candidate_minus_control": difference,
                "relative_change_percent": relative_change_percent,
            }

        primary = metrics[experiment.primary_metric]
        sufficient = (
            primary["control"]["sample_count"] >= experiment.minimum_samples
            and primary["candidate"]["sample_count"] >= experiment.minimum_samples
        )

        significant = False
        p_value = None
        effect_size = None
        if (
            primary["control"]["sample_count"] >= 2
            and primary["candidate"]["sample_count"] >= 2
        ):
            control_values = _metric_values(control, experiment.primary_metric)
            candidate_values = _metric_values(candidate, experiment.primary_metric)
            control_var = stdev(control_values) ** 2
            candidate_var = stdev(candidate_values) ** 2
            standard_error = math.sqrt(
                control_var / len(control_values)
                + candidate_var / len(candidate_values)
            )
            effect_size = mean(candidate_values) - mean(control_values)
            if standard_error > 0:
                z_score = effect_size / standard_error
                p_value = 2 * (1 - NormalDist().cdf(abs(z_score)))
                significant = p_value < 0.05
            elif effect_size != 0:
                p_value = 0.0
                significant = True
            else:
                p_value = 1.0

        if not sufficient:
            decision = "insufficient_data"
        elif not significant:
            decision = "no_statistically_significant_difference"
        else:
            higher_is_better = experiment.primary_metric == "quality_score"
            candidate_better = effect_size > 0 if higher_is_better else effect_size < 0
            decision = "candidate_better" if candidate_better else (
                "control_better" if effect_size != 0 else "no_difference"
            )

        return {
            "experiment_id": experiment.experiment_id,
            "control_name": control.name,
            "candidate_name": candidate.name,
            "primary_metric": experiment.primary_metric,
            "metrics": metrics,
            "statistical_test": {
                "method": "two-sided normal approximation (Welch-style standard error)",
                "p_value": p_value,
                "alpha": 0.05,
                "statistically_significant": significant,
                "mean_difference_candidate_minus_control": effect_size,
            },
            "sufficient_samples": sufficient,
            "decision": decision,
            "interpretation_note": (
                "The statistical test is an approximate independent-samples test. "
                "It assumes independent observations and may be unreliable for small "
                "samples or non-normal metrics. The decision applies only to the primary "
                "metric; inspect quality, cost, and latency together before deployment."
            ),
        }
