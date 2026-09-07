"""
Application Metrics

Provides:
- Request metrics
- Error metrics
- Latency tracking
- Database metrics
- AI model usage metrics

Compatible with:
- Prometheus
- Grafana
- OpenTelemetry
"""

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
)


# ==========================
# HTTP Metrics
# ==========================

REQUEST_COUNT = Counter(
    "api_requests_total",
    "Total number of API requests",
    [
        "method",
        "endpoint",
        "status_code",
    ],
)


REQUEST_LATENCY = Histogram(
    "api_request_latency_seconds",
    "API request latency",
    [
        "endpoint",
    ],
)


REQUEST_ERRORS = Counter(
    "api_errors_total",
    "Total API errors",
    [
        "endpoint",
        "error_type",
    ],
)


# ==========================
# Database Metrics
# ==========================

DATABASE_CONNECTIONS = Gauge(
    "database_connections_active",
    "Active database connections",
)


DATABASE_ERRORS = Counter(
    "database_errors_total",
    "Database errors count",
)



# ==========================
# AI Model Metrics
# ==========================

AI_REQUEST_COUNT = Counter(
    "ai_requests_total",
    "Total AI model requests",
    [
        "provider",
        "model",
    ],
)


AI_TOKEN_USAGE = Counter(
    "ai_token_usage_total",
    "Total AI token usage",
    [
        "provider",
        "model",
    ],
)


AI_RESPONSE_TIME = Histogram(
    "ai_response_time_seconds",
    "AI model response latency",
    [
        "provider",
        "model",
    ],
)



# ==========================
# Cache Metrics
# ==========================

CACHE_HITS = Counter(
    "cache_hits_total",
    "Cache successful hits",
    [
        "cache",
    ],
)


CACHE_MISSES = Counter(
    "cache_misses_total",
    "Cache misses",
    [
        "cache",
    ],
)



# ==========================
# Helper Functions
# ==========================


def record_request(
    method: str,
    endpoint: str,
    status_code: int,
):
    """
    Record API request.
    """

    REQUEST_COUNT.labels(
        method=method,
        endpoint=endpoint,
        status_code=status_code,
    ).inc()



def record_error(
    endpoint: str,
    error_type: str,
):
    """
    Record API error.
    """

    REQUEST_ERRORS.labels(
        endpoint=endpoint,
        error_type=error_type,
    ).inc()



def record_ai_usage(
    provider: str,
    model: str,
    tokens: int,
):
    """
    Record AI model usage.
    """

    AI_REQUEST_COUNT.labels(
        provider=provider,
        model=model,
    ).inc()


    AI_TOKEN_USAGE.labels(
        provider=provider,
        model=model,
    ).inc(tokens)



def get_metrics():
    """
    Generate Prometheus metrics output.
    """

    return generate_latest() 