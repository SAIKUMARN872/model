import { isIP } from "node:net";

export type HttpClientErrorCode =
  | "configuration"
  | "invalid_url"
  | "origin_not_allowed"
  | "invalid_request"
  | "timeout"
  | "aborted"
  | "network"
  | "http"
  | "redirect"
  | "response_too_large"
  | "invalid_content_type"
  | "invalid_json";

export class HttpClientError extends Error {
  readonly code: HttpClientErrorCode;
  readonly status?: number;

  constructor(
    code: HttpClientErrorCode,
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = "HttpClientError";
    this.code = code;
    this.status = status;
  }
}

export interface HttpClientOptions {
  readonly allowedOrigins: readonly string[];
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
  readonly allowInsecureLocalhost?: boolean;
  readonly fetchImpl?: typeof fetch;
}

export interface HttpJsonRequestOptions {
  readonly method?: string;
  readonly headers?: HeadersInit;
  readonly body?: unknown;
  readonly signal?: AbortSignal;
}

export interface HttpJsonResponse<T> {
  readonly status: number;
  readonly headers: Headers;
  readonly data: T | null;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;
const MAX_TIMEOUT_MS = 120_000;
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024;

function isLoopback(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    host === "localhost" ||
    host === "::1" ||
    (isIP(host) === 4 && host.startsWith("127."))
  );
}

function validatePositiveInteger(
  value: number,
  name: string,
  maximum: number,
): void {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new HttpClientError(
      "configuration",
      `${name} must be a positive integer no greater than ${maximum}.`,
    );
  }
}

export class HttpClient {
  private readonly allowedOrigins: ReadonlySet<string>;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;
  private readonly allowInsecureLocalhost: boolean;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpClientOptions) {
    if (
      !options ||
      !Array.isArray(options.allowedOrigins) ||
      options.allowedOrigins.length === 0
    ) {
      throw new HttpClientError(
        "configuration",
        "At least one explicitly allowed origin is required.",
      );
    }

    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxResponseBytes =
      options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    this.allowInsecureLocalhost =
      options.allowInsecureLocalhost ?? false;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;

    validatePositiveInteger(this.timeoutMs, "timeoutMs", MAX_TIMEOUT_MS);
    validatePositiveInteger(
      this.maxResponseBytes,
      "maxResponseBytes",
      MAX_RESPONSE_BYTES,
    );

    if (typeof this.fetchImpl !== "function") {
      throw new HttpClientError(
        "configuration",
        "A compatible fetch implementation is required.",
      );
    }

    const origins = new Set<string>();

    for (const origin of options.allowedOrigins) {
      let parsed: URL;

      try {
        parsed = new URL(origin);
      } catch {
        throw new HttpClientError(
          "configuration",
          "Every allowed origin must be a valid absolute URL.",
        );
      }

      if (
        parsed.origin !== origin ||
        parsed.username.length > 0 ||
        parsed.password.length > 0 ||
        parsed.pathname !== "/" ||
        parsed.search.length > 0 ||
        parsed.hash.length > 0
      ) {
        throw new HttpClientError(
          "configuration",
          "Allowed origins must contain only a scheme, host, and optional port.",
        );
      }

      if (
        parsed.protocol !== "https:" &&
        !(
          parsed.protocol === "http:" &&
          this.allowInsecureLocalhost &&
          isLoopback(parsed.hostname)
        )
      ) {
        throw new HttpClientError(
          "configuration",
          "Allowed origins must use HTTPS, except explicitly enabled loopback HTTP.",
        );
      }

      origins.add(parsed.origin);
    }

    this.allowedOrigins = origins;
  }

  async requestJson<T = unknown>(
    input: string | URL,
    options: HttpJsonRequestOptions = {},
  ): Promise<HttpJsonResponse<T>> {
    const url = this.validateUrl(input);
    const method = options.method ?? "GET";

    if (!/^[A-Z]+$/.test(method)) {
      throw new HttpClientError(
        "invalid_request",
        "The HTTP method must contain uppercase letters only.",
      );
    }

    if (options.signal?.aborted) {
      throw new HttpClientError(
        "aborted",
        "The HTTP request was cancelled.",
      );
    }

    const headers = new Headers(options.headers);
    headers.set("accept", "application/json");

    let body: string | undefined;

    if (options.body !== undefined) {
      try {
        body = JSON.stringify(options.body);
      } catch {
        throw new HttpClientError(
          "invalid_request",
          "The request body could not be serialized as JSON.",
        );
      }

      if (body === undefined) {
        throw new HttpClientError(
          "invalid_request",
          "The request body must be JSON serializable.",
        );
      }

      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }

    const controller = new AbortController();
    let timedOut = false;

    const onCallerAbort = () => {
      controller.abort();
    };

    options.signal?.addEventListener("abort", onCallerAbort, {
      once: true,
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel().catch(() => undefined);

        throw new HttpClientError(
          "redirect",
          "Redirect responses are not followed by this HTTP client.",
          response.status,
        );
      }

      const contentLength = response.headers.get("content-length");

      if (contentLength !== null && /^\d+$/.test(contentLength)) {
        if (Number(contentLength) > this.maxResponseBytes) {
          await response.body?.cancel().catch(() => undefined);

          throw new HttpClientError(
            "response_too_large",
            "The HTTP response exceeds the configured size limit.",
          );
        }
      }

      const bytes = await this.readBoundedBody(response);

      if (!response.ok) {
        throw new HttpClientError(
          "http",
          `The HTTP server returned status ${response.status}.`,
          response.status,
        );
      }

      if (bytes.byteLength === 0) {
        return {
          status: response.status,
          headers: response.headers,
          data: null,
        };
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (!/^(application\/json|application\/[^;]+\+json)(?:\s*;|$)/i.test(contentType)) {
        throw new HttpClientError(
          "invalid_content_type",
          "The HTTP response did not contain a JSON content type.",
          response.status,
        );
      }

      let text: string;

      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        throw new HttpClientError(
          "invalid_json",
          "The HTTP response was not valid UTF-8 JSON.",
          response.status,
        );
      }

      let data: T;

      try {
        data = JSON.parse(text) as T;
      } catch {
        throw new HttpClientError(
          "invalid_json",
          "The HTTP response contained invalid JSON.",
          response.status,
        );
      }

      return {
        status: response.status,
        headers: response.headers,
        data,
      };
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error;
      }

      if (timedOut) {
        throw new HttpClientError(
          "timeout",
          "The HTTP request exceeded its configured timeout.",
        );
      }

      if (options.signal?.aborted) {
        throw new HttpClientError(
          "aborted",
          "The HTTP request was cancelled.",
        );
      }

      throw new HttpClientError(
        "network",
        "The HTTP request failed before a valid response was received.",
      );
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", onCallerAbort);
    }
  }

  private validateUrl(input: string | URL): URL {
    let url: URL;

    try {
      url = new URL(input instanceof URL ? input.href : input);
    } catch {
      throw new HttpClientError(
        "invalid_url",
        "The request URL must be an absolute HTTP or HTTPS URL.",
      );
    }

    if (url.username.length > 0 || url.password.length > 0) {
      throw new HttpClientError(
        "invalid_url",
        "Credentials embedded in request URLs are not allowed.",
      );
    }

    if (!this.allowedOrigins.has(url.origin)) {
      throw new HttpClientError(
        "origin_not_allowed",
        "The request destination is not in the configured origin allowlist.",
      );
    }

    if (url.protocol !== "https:") {
      if (
        url.protocol !== "http:" ||
        !this.allowInsecureLocalhost ||
        !isLoopback(url.hostname)
      ) {
        throw new HttpClientError(
          "invalid_url",
          "Request URLs must use HTTPS, except explicitly enabled loopback HTTP.",
        );
      }
    }

    url.hash = "";
    return url;
  }

  private async readBoundedBody(
    response: Response,
  ): Promise<Uint8Array> {
    if (!response.body) {
      return new Uint8Array();
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
      while (true) {
        const result = await reader.read();

        if (result.done) {
          break;
        }

        totalBytes += result.value.byteLength;

        if (totalBytes > this.maxResponseBytes) {
          await reader.cancel().catch(() => undefined);

          throw new HttpClientError(
            "response_too_large",
            "The HTTP response exceeds the configured size limit.",
          );
        }

        chunks.push(result.value);
      }
    } finally {
      reader.releaseLock();
    }

    const combined = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return combined;
  }
}
