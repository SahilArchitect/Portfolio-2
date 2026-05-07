"""OpenTelemetry bootstrap.

In development, traces are exported to the console for visibility. In other
environments, the OTLP HTTP exporter is used when `otel_exporter_otlp_endpoint`
is configured. FastAPI and SQLAlchemy are instrumented automatically by the
`setup_otel` call in `main.py`.
"""

from __future__ import annotations

import importlib
import logging

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
    SimpleSpanProcessor,
)

from .settings import Settings

log = logging.getLogger(__name__)


def _instrument_optional(module_name: str, class_name: str) -> None:
    try:
        module = importlib.import_module(module_name)
        instrumentor = getattr(module, class_name)
        instrumentor().instrument()
    except Exception as exc:
        log.debug("Optional OTel instrumentation skipped for %s: %s", module_name, exc)


def setup_otel(settings: Settings) -> None:
    resource = Resource.create({"service.name": settings.otel_service_name})
    provider = TracerProvider(resource=resource)

    if settings.environment == "development" or settings.otel_exporter_otlp_endpoint is None:
        provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    else:
        provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint),
            )
        )

    trace.set_tracer_provider(provider)
    _instrument_optional("opentelemetry.instrumentation.redis", "RedisInstrumentor")
    _instrument_optional("opentelemetry.instrumentation.httpx", "HTTPXClientInstrumentor")
