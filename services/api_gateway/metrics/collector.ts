import {
  MetricsRegistry,
  MetricLabels,
  metrics,
} from "./metrics.js";

export interface RequestMetricInput {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  success?: boolean;
}

export interface ModelMetricInput {
  provider: string;
  model: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  success?: boolean;
}

export class MetricsCollector {
  constructor(
    private readonly registry: MetricsRegistry,
  ) {
    this.registerDefaultMetrics();
  }

  recordRequest(
    input: RequestMetricInput,
  ): void {
    const labels: MetricLabels = {
      method: input.method,
      route: input.route,
      status_code: input.statusCode,
    };

    this.registry.increment(
      "http_requests_total",
      1,
      labels,
    );

    this.registry.observe(
      "http_request_duration_ms",
      input.durationMs,
      {
        method: input.method,
        route: input.route,
      },
    );

    if (
      input.statusCode >= 400
    ) {
      this.registry.increment(
        "http_errors_total",
        1,
        {
          method: input.method,
          route: input.route,
          status_code:
            input.statusCode,
        },
      );
    }
  }

  recordModelRequest(
    input: ModelMetricInput,
  ): void {
    const labels = {
      provider: input.provider,
      model: input.model,
    };

    this.registry.increment(
      "model_requests_total",
      1,
      labels,
    );

    this.registry.observe(
      "model_request_duration_ms",
      input.durationMs,
      labels,
    );

    if (
      input.inputTokens !== undefined
    ) {
      this.registry.increment(
        "model_input_tokens_total",
        input.inputTokens,
        labels,
      );
    }

    if (
      input.outputTokens !== undefined
    ) {
      this.registry.increment(
        "model_output_tokens_total",
        input.outputTokens,
        labels,
      );
    }

    if (input.success === false) {
      this.registry.increment(
        "model_errors_total",
        1,
        labels,
      );
    }
  }

  recordCacheHit(
    cacheName = "default",
  ): void {
    this.registry.increment(
      "cache_hits_total",
      1,
      {
        cache: cacheName,
      },
    );
  }

  recordCacheMiss(
    cacheName = "default",
  ): void {
    this.registry.increment(
      "cache_misses_total",
      1,
      {
        cache: cacheName,
      },
    );
  }

  setActiveRequests(
    value: number,
  ): void {
    this.registry.setGauge(
      "active_requests",
      value,
    );
  }

  incrementActiveRequests(): number {
    return this.registry.incrementGauge(
      "active_requests",
      1,
    );
  }

  decrementActiveRequests(): number {
    return this.registry.decrementGauge(
      "active_requests",
      1,
    );
  }

  recordAuthentication(
    outcome: "success" | "failure",
  ): void {
    this.registry.increment(
      "authentication_attempts_total",
      1,
      {
        outcome,
      },
    );
  }

  recordAuthorization(
    outcome: "allowed" | "denied",
  ): void {
    this.registry.increment(
      "authorization_checks_total",
      1,
      {
        outcome,
      },
    );
  }

  snapshot() {
    return this.registry.snapshot();
  }

  health() {
    return this.registry.health();
  }

  private registerDefaultMetrics(): void {
    this.registerCounter(
      "http_requests_total",
      "Total HTTP requests",
      "requests",
    );

    this.registerCounter(
      "http_errors_total",
      "Total HTTP error responses",
      "errors",
    );

    this.registerHistogram(
      "http_request_duration_ms",
      "HTTP request duration",
      "milliseconds",
    );

    this.registerGauge(
      "active_requests",
      "Currently active HTTP requests",
      "requests",
    );

    this.registerCounter(
      "model_requests_total",
      "Total AI model requests",
      "requests",
    );

    this.registerCounter(
      "model_errors_total",
      "Total AI model errors",
      "errors",
    );

    this.registerHistogram(
      "model_request_duration_ms",
      "AI model request duration",
      "milliseconds",
    );

    this.registerCounter(
      "model_input_tokens_total",
      "Total model input tokens",
      "tokens",
    );

    this.registerCounter(
      "model_output_tokens_total",
      "Total model output tokens",
      "tokens",
    );

    this.registerCounter(
      "cache_hits_total",
      "Total cache hits",
      "hits",
    );

    this.registerCounter(
      "cache_misses_total",
      "Total cache misses",
      "misses",
    );

    this.registerCounter(
      "authentication_attempts_total",
      "Authentication attempts",
      "attempts",
    );

    this.registerCounter(
      "authorization_checks_total",
      "Authorization checks",
      "checks",
    );
  }

  private registerCounter(
    name: string,
    description: string,
    unit: string,
  ): void {
    if (
      !this.registry.getDefinition(name)
    ) {
      this.registry.registerCounter(
        name,
        description,
        unit,
      );
    }
  }

  private registerGauge(
    name: string,
    description: string,
    unit: string,
  ): void {
    if (
      !this.registry.getDefinition(name)
    ) {
      this.registry.registerGauge(
        name,
        description,
        unit,
      );
    }
  }

  private registerHistogram(
    name: string,
    description: string,
    unit: string,
  ): void {
    if (
      !this.registry.getDefinition(name)
    ) {
      this.registry.registerHistogram(
        name,
        description,
        unit,
      );
    }
  }
}

export const metricsCollector =
  new MetricsCollector(metrics);