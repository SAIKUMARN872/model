"""Latency and throughput measurement helpers for ModelNow."""
import math


def _validate_latency(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("latency values must be numbers")
    if not math.isfinite(value) or value < 0:
        raise ValueError("latency values must be finite and nonnegative")
    return float(value)


def mean_latency(latencies_ms):
    """Return average latency in milliseconds."""
    values = [_validate_latency(value) for value in latencies_ms]
    if not values:
        raise ValueError("at least one latency value is required")
    return sum(values) / len(values)


def percentile_latency(latencies_ms, percentile: float) -> float:
    """Return an interpolated latency percentile (0 through 100)."""
    values = sorted(_validate_latency(value) for value in latencies_ms)
    if not values:
        raise ValueError("at least one latency value is required")
    if isinstance(percentile, bool) or not isinstance(percentile, (int, float)):
        raise ValueError("percentile must be a number")
    if not math.isfinite(percentile) or not 0 <= percentile <= 100:
        raise ValueError("percentile must be between 0 and 100")
    if len(values) == 1:
        return values[0]
    position = (len(values) - 1) * (percentile / 100.0)
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    fraction = position - lower
    return values[lower] + (values[upper] - values[lower]) * fraction


def throughput_requests_per_second(request_count: int, duration_seconds: float) -> float:
    """Calculate completed requests per second over a measured duration."""
    if isinstance(request_count, bool) or not isinstance(request_count, int):
        raise ValueError("request_count must be an integer")
    if request_count < 0:
        raise ValueError("request_count must be nonnegative")
    if isinstance(duration_seconds, bool) or not isinstance(duration_seconds, (int, float)):
        raise ValueError("duration_seconds must be a number")
    if not math.isfinite(duration_seconds) or duration_seconds <= 0:
        raise ValueError("duration_seconds must be finite and greater than zero")
    return request_count / duration_seconds
