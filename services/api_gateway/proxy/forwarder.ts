import {
  ProxyTimeoutError,
  withTimeout,
} from "./timeout.js";

export interface ForwardRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface ForwardResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
}

export interface ForwarderOptions {
  defaultTimeoutMs?: number;
  fetchImplementation?: typeof fetch;
}

export class ProxyForwarder {
  private readonly defaultTimeoutMs: number;

  private readonly fetchImplementation: typeof fetch;

  constructor(options: ForwarderOptions = {}) {
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 30_000;
    this.fetchImplementation =
      options.fetchImplementation ?? fetch;
  }

  async forward(
    request: ForwardRequest,
  ): Promise<ForwardResponse> {
    if (!request.url) {
      throw new Error("Proxy target URL is required");
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(request.url);
    } catch {
      throw new Error(`Invalid proxy target URL: ${request.url}`);
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      throw new Error(
        "Proxy target URL must use http or https",
      );
    }

    const timeoutMs =
      request.timeoutMs ?? this.defaultTimeoutMs;

    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new Error(
        "timeoutMs must be greater than 0",
      );
    }

    const startedAt = Date.now();

    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await withTimeout(
        this.fetchImplementation(request.url, {
          method: request.method ?? "GET",
          headers: request.headers,
          body: request.body,
          signal: controller.signal,
        }),
        timeoutMs,
      );

      const body = await response.text();

      const headers: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      if (
        error instanceof ProxyTimeoutError ||
        controller.signal.aborted
      ) {
        throw new ProxyTimeoutError(timeoutMs);
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}