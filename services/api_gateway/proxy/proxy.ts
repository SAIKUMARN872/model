import {
  ProxyForwarder,
  type ForwardRequest,
  type ForwardResponse,
  type ForwarderOptions,
} from "./forwarder.js";

export interface ProxyOptions extends ForwarderOptions {
  allowedHosts?: string[];
  stripHeaders?: string[];
}

export interface ProxyRequest {
  targetUrl: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface ProxyResult {
  success: boolean;
  response?: ForwardResponse;
  error?: string;
}

export class ProxyService {
  private readonly forwarder: ProxyForwarder;

  private readonly allowedHosts?: Set<string>;

  private readonly stripHeaders: Set<string>;

  constructor(options: ProxyOptions = {}) {
    this.forwarder = new ProxyForwarder(options);

    if (options.allowedHosts) {
      this.allowedHosts = new Set(
        options.allowedHosts.map((host) =>
          host.toLowerCase(),
        ),
      );
    }

    this.stripHeaders = new Set(
      (
        options.stripHeaders ?? [
          "connection",
          "keep-alive",
          "proxy-authenticate",
          "proxy-authorization",
          "te",
          "trailer",
          "transfer-encoding",
          "upgrade",
        ]
      ).map((header) => header.toLowerCase()),
    );
  }

  private validateTarget(targetUrl: string): URL {
    let url: URL;

    try {
      url = new URL(targetUrl);
    } catch {
      throw new Error(
        `Invalid target URL: ${targetUrl}`,
      );
    }

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      throw new Error(
        "Only HTTP and HTTPS proxy targets are supported",
      );
    }

    if (this.allowedHosts) {
      const hostname = url.hostname.toLowerCase();

      if (!this.allowedHosts.has(hostname)) {
        throw new Error(
          `Proxy target host is not allowed: ${hostname}`,
        );
      }
    }

    return url;
  }

  private sanitizeHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (!this.stripHeaders.has(key.toLowerCase())) {
        result[key] = value;
      }
    }

    return result;
  }

  async forward(
    request: ProxyRequest,
  ): Promise<ForwardResponse> {
    const target = this.validateTarget(request.targetUrl);

    const headers = this.sanitizeHeaders(
      request.headers,
    );

    const forwardRequest: ForwardRequest = {
      url: target.toString(),
      method: request.method ?? "GET",
      headers,
      body: request.body,
      timeoutMs: request.timeoutMs,
    };

    return this.forwarder.forward(forwardRequest);
  }

  async execute(
    request: ProxyRequest,
  ): Promise<ProxyResult> {
    try {
      const response = await this.forward(request);

      return {
        success: response.status >= 200 &&
          response.status < 400,
        response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown proxy error",
      };
    }
  }

  health(): {
    healthy: boolean;
    allowedHosts: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      allowedHosts: this.allowedHosts?.size ?? 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const proxyService = new ProxyService();