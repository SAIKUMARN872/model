"""
Application distributed tracing.

Provides OpenTelemetry based tracing for:
- API requests
- Database calls
- AI model calls
- External services
- Background tasks
"""

from __future__ import annotations

from typing import Any

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
)

from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)

from app.core.config import settings
from app.core.logging import logger


tracer = trace.get_tracer(
    "app",
)



def configure_tracing() -> None:
    """
    Configure OpenTelemetry tracing.
    """

    resource = Resource.create(
        {
            "service.name": settings.APP_NAME,
            "service.version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
        }
    )


    provider = TracerProvider(
        resource=resource,
    )


    if settings.OTEL_EXPORTER_ENDPOINT:

        exporter = OTLPSpanExporter(
            endpoint=settings.OTEL_EXPORTER_ENDPOINT,
        )


        processor = BatchSpanProcessor(
            exporter,
        )


        provider.add_span_processor(
            processor,
        )


    trace.set_tracer_provider(
        provider,
    )


    logger.info(
        "Tracing initialized successfully."
    )



def get_tracer(
    name: str = "app",
):
    """
    Get tracer instance.
    """

    return trace.get_tracer(
        name,
    )



def start_span(
    name: str,
    attributes: dict[str, Any] | None = None,
):
    """
    Create a tracing span.
    """

    span = tracer.start_span(
        name,
    )


    if attributes:

        for key, value in attributes.items():

            span.set_attribute(
                key,
                value,
            )


    return span



class TraceContext:
    """
    Helper context manager for tracing.
    """

    def __init__(
        self,
        name: str,
        attributes: dict[str, Any] | None = None,
    ):

        self.name = name

        self.attributes = attributes or {}

        self.span = None


    def __enter__(self):

        self.span = tracer.start_span(
            self.name,
        )


        for key, value in self.attributes.items():

            self.span.set_attribute(
                key,
                value,
            )


        return self.span



    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):

        if exc_value:

            self.span.record_exception(
                exc_value,
            )

            self.span.set_status(
                trace.Status(
                    trace.StatusCode.ERROR,
                )
            )


        self.span.end()