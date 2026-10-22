import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, test } from "node:test";
import {
  HttpClient,
  HttpClientError,
} from "./http.client.js";

let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer((request, response) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      const path = request.url ?? "/";

      if (path === "/ok") {
        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify({ success: true }));
        return;
      }

      if (path === "/post") {
        response.writeHead(201, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify({
          method: request.method,
          body: Buffer.concat(chunks).toString("utf8"),
        }));
        return;
      }

      if (path === "/bad-json") {
        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end("{invalid");
        return;
      }

      if (path === "/text") {
        response.writeHead(200, {
          "content-type": "text/plain",
        });
        response.end("not json");
        return;
      }

      if (path === "/large") {
        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify({ value: "x".repeat(4096) }));
        return;
      }

      if (path === "/error") {
        response.writeHead(502, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify({ secret: "must not leak" }));
        return;
      }

      if (path === "/redirect") {
        response.writeHead(302, { location: "/ok" });
        response.end();
        return;
      }

      if (path === "/slow") {
        setTimeout(() => {
          if (!response.destroyed) {
            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify({ done: true }));
          }
        }, 150);
        return;
      }

      response.writeHead(404, {
        "content-type": "application/json",
      });
      response.end("{}");
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Could not determine the test server address."));
        return;
      }

      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });

    server.once("error", reject);
  });
});

after(async () => {
  if (server?.listening) {
    server.closeAllConnections();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

function createTestClient(
  overrides: Partial<ConstructorParameters<typeof HttpClient>[0]> = {},
): HttpClient {
  return new HttpClient({
    allowedOrigins: [baseUrl],
    allowInsecureLocalhost: true,
    ...overrides,
  });
}

async function expectClientError(
  promise: Promise<unknown>,
  code: HttpClientError["code"],
): Promise<HttpClientError> {
  let captured: unknown;

  try {
    await promise;
  } catch (error) {
    captured = error;
  }

  assert.ok(captured instanceof HttpClientError);
  assert.equal(captured.code, code);
  return captured;
}

test("returns parsed JSON for a successful response", async () => {
  const client = createTestClient();
  const result = await client.requestJson<{ success: boolean }>(
    `${baseUrl}/ok`,
  );

  assert.equal(result.status, 200);
  assert.deepEqual(result.data, { success: true });
});

test("serializes JSON request bodies", async () => {
  const client = createTestClient();
  const result = await client.requestJson<{
    method: string;
    body: string;
  }>(`${baseUrl}/post`, {
    method: "POST",
    body: { message: "hello" },
  });

  assert.equal(result.status, 201);
  assert.equal(result.data?.method, "POST");
  assert.deepEqual(
    JSON.parse(result.data?.body ?? "{}"),
    { message: "hello" },
  );
});

test("rejects HTTP errors without exposing response bodies", async () => {
  const client = createTestClient();
  const error = await expectClientError(
    client.requestJson(`${baseUrl}/error`),
    "http",
  );

  assert.equal(error.status, 502);
  assert.equal(error.message.includes("must not leak"), false);
});

test("rejects malformed JSON", async () => {
  const client = createTestClient();

  await expectClientError(
    client.requestJson(`${baseUrl}/bad-json`),
    "invalid_json",
  );
});

test("rejects non-JSON responses", async () => {
  const client = createTestClient();

  await expectClientError(
    client.requestJson(`${baseUrl}/text`),
    "invalid_content_type",
  );
});

test("enforces the response byte limit", async () => {
  const client = createTestClient({ maxResponseBytes: 128 });

  await expectClientError(
    client.requestJson(`${baseUrl}/large`),
    "response_too_large",
  );
});

test("rejects origins that are not explicitly allowed", async () => {
  const client = new HttpClient({
    allowedOrigins: ["https://example.com"],
  });

  await expectClientError(
    client.requestJson(`${baseUrl}/ok`),
    "origin_not_allowed",
  );
});

test("rejects redirects rather than following them", async () => {
  const client = createTestClient();

  await expectClientError(
    client.requestJson(`${baseUrl}/redirect`),
    "redirect",
  );
});

test("enforces request timeouts", async () => {
  const client = createTestClient({ timeoutMs: 30 });

  await expectClientError(
    client.requestJson(`${baseUrl}/slow`),
    "timeout",
  );
});

test("supports caller cancellation", async () => {
  const client = createTestClient();
  const controller = new AbortController();
  const pending = client.requestJson(`${baseUrl}/slow`, {
    signal: controller.signal,
  });

  setTimeout(() => controller.abort(), 20);

  await expectClientError(pending, "aborted");
});

test("rejects credentials embedded in URLs", async () => {
  const client = createTestClient();

  await expectClientError(
    client.requestJson(`http://user:password@127.0.0.1/ok`),
    "invalid_url",
  );
});

test("rejects insecure remote HTTP origins during configuration", () => {
  assert.throws(
    () => new HttpClient({
      allowedOrigins: ["http://example.com"],
    }),
    (error: unknown) =>
      error instanceof HttpClientError &&
      error.code === "configuration",
  );
});
