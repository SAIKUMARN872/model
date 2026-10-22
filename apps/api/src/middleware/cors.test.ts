import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response, NextFunction } from "express";
import { corsMiddleware } from "./cors.js";
import { settings } from "../config/settings.js";

type MockResponse = {
  headers: Record<string, string>;
  statusCode?: number;
  endCalled: boolean;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  getHeader: (name: string) => string | undefined;
  end: () => MockResponse;
};

function invokeCors(origin?: string) {
  const headers: Record<string, string> = {};
  const response: MockResponse = {
    headers,
    endCalled: false,
    setHeader(name, value) {
      headers[name.toLowerCase()] = String(value);
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    end() {
      this.endCalled = true;
      return this;
    },
  };

  let nextCalled = false;
  let nextError: unknown;

  const request = {
    method: "GET",
    headers: origin ? { origin } : {},
  };

  const next: NextFunction = (error?: unknown) => {
    nextCalled = true;
    nextError = error;
  };

  corsMiddleware(
    request as Request,
    response as unknown as Response,
    next,
  );

  return { headers, nextCalled, nextError };
}

test("configured origins receive the matching allow-origin header", () => {
  const origin = settings.security.corsOrigins[0];
  const result = invokeCors(origin);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.headers["access-control-allow-origin"], origin);
  assert.equal(result.headers["access-control-allow-credentials"], "true");
  assert.equal(result.headers.vary, "Origin");
});

test("requests without an origin are not rejected by CORS", () => {
  const result = invokeCors();

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.headers["access-control-allow-origin"], undefined);
});

test("unconfigured origins are not granted an allow-origin header", () => {
  const result = invokeCors("https://not-configured.invalid");

  assert.equal(result.nextCalled, true);
  assert.ok(result.nextError == null, "CORS should not report an error");
  assert.ok(
    result.headers["access-control-allow-origin"] == null,
    "an unconfigured origin must not receive an allow-origin value",
  );
});

test("preflight requests are handled by the CORS middleware", () => {
  const headers: Record<string, string> = {};
  const response = {
    headersSent: false,
    statusCode: 200,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers[name.toLowerCase()] = String(value);
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()];
    },
    end() {
      this.headersSent = true;
      return this;
    },
  };

  let nextCalled = false;
  const request = {
    method: "OPTIONS",
    headers: { origin: settings.security.corsOrigins[0] },
  };

  corsMiddleware(
    request as Request,
    response as unknown as Response,
    () => {
      nextCalled = true;
    },
  );

  assert.equal(nextCalled, false);
  assert.equal(headers["access-control-allow-origin"], settings.security.corsOrigins[0]);
  assert.ok(headers["access-control-allow-methods"]);
});
