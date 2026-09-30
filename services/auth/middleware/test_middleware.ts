import assert from "node:assert/strict";

import {
  AuthMiddleware,
  type AuthRequest,
  SecurityMiddleware,
} from "./index.js";

console.log("");
console.log("========================================");
console.log("        AUTH MIDDLEWARE MOCK TEST");
console.log("========================================");
console.log("");

let passed = 0;
let failed = 0;

function test(
  name: string,
  fn: () => void,
): void {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ FAIL: ${name}`);

    if (error instanceof Error) {
      console.log(`  ${error.message}`);
    } else {
      console.log(`  ${String(error)}`);
    }

    failed++;
  }
}

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

test("Auth - authenticate valid token", () => {
  const auth = new AuthMiddleware(
    (token) => {
      if (token === "valid-token") {
        return {
          id: "user-001",
          roles: ["user"],
          authenticated: true,
        };
      }

      return undefined;
    },
  );

  const request = {
    headers: {
      authorization: "Bearer valid-token",
    },
  };

  const result = auth.authenticate(request);

  assert.equal(result.authenticated, true);
  assert.ok(result.user);
  assert.equal(result.user.id, "user-001");
});

test("Auth - reject missing authorization", () => {
  const auth = new AuthMiddleware(
    () => undefined,
  );

  const result = auth.authenticate({
    headers: {},
  });

  assert.equal(result.authenticated, false);
});

test("Auth - reject invalid bearer token", () => {
  const auth = new AuthMiddleware(
    (token) => {
      if (token === "valid-token") {
        return {
          id: "user-001",
          roles: ["user"],
          authenticated: true,
        };
      }

      return undefined;
    },
  );

  const result = auth.authenticate({
    headers: {
      authorization: "Bearer invalid-token",
    },
  });

  assert.equal(result.authenticated, false);
});

test("Auth - reject non bearer authentication", () => {
  const auth = new AuthMiddleware(
    () => ({
      id: "user-001",
      roles: ["user"],
      authenticated: true,
    }),
  );

  const result = auth.authenticate({
    headers: {
      authorization: "Basic abc123",
    },
  });

  assert.equal(result.authenticated, false);
});

test("Auth - attach authenticated user", () => {
  const auth = new AuthMiddleware(
    () => ({
      id: "user-002",
      roles: ["admin"],
      authenticated: true,
    }),
  );

  const request: AuthRequest = {
    headers: {
      authorization: "Bearer admin-token",
    },
  };

  auth.authenticate(request);

  assert.ok(request.user);
  assert.equal(request.user.id, "user-002");
});

test("Auth - require role", () => {
  const auth = new AuthMiddleware(
    () => ({
      id: "user-003",
      roles: ["admin", "user"],
      authenticated: true,
    }),
  );

  const request: AuthRequest = {
    headers: {
      authorization: "Bearer token",
    },
  };

  auth.authenticate(request);

  assert.equal(
    auth.requireRole(request, "admin"),
    true,
  );

  assert.equal(
    auth.requireRole(request, "manager"),
    false,
  );
});

test("Auth - require any role", () => {
  const auth = new AuthMiddleware(
    () => ({
      id: "user-004",
      roles: ["user", "developer"],
      authenticated: true,
    }),
  );

  const request: AuthRequest = {
    headers: {
      authorization: "Bearer token",
    },
  };

  auth.authenticate(request);

  assert.equal(
    auth.requireAnyRole(
      request,
      ["admin", "developer"],
    ),
    true,
  );
});

test("Auth - authentication status", () => {
  const auth = new AuthMiddleware(
    () => ({
      id: "user-005",
      roles: ["user"],
      authenticated: true,
    }),
  );

  const request: AuthRequest = {
    headers: {
      authorization: "Bearer token",
    },
  };

  assert.equal(
    auth.isAuthenticated(request),
    false,
  );

  auth.authenticate(request);

  assert.equal(
    auth.isAuthenticated(request),
    true,
  );
});

// --------------------------------------------------
// SECURITY
// --------------------------------------------------

test("Security - allow GET request", () => {
  const security = new SecurityMiddleware();

  const result = security.validate({
    method: "GET",
    path: "/api/users",
  });

  assert.equal(result.allowed, true);
});

test("Security - allow POST request", () => {
  const security = new SecurityMiddleware();

  const result = security.validate({
    method: "POST",
    path: "/api/users",
  });

  assert.equal(result.allowed, true);
});

test("Security - reject unsupported method", () => {
  const security = new SecurityMiddleware();

  const result = security.validate({
    method: "TRACE",
    path: "/api/users",
  });

  assert.equal(result.allowed, false);
});

test("Security - validate body size", () => {
  const security = new SecurityMiddleware({
    maxBodySize: 10,
  });

  assert.equal(
    security.validateBodySize("hello"),
    true,
  );

  assert.equal(
    security.validateBodySize(
      "this body is too large",
    ),
    false,
  );
});

test("Security - sanitize header", () => {
  const security = new SecurityMiddleware();

  const result =
    security.sanitizeHeaderValue(
      "  hello\r\nworld  ",
    );

  assert.equal(result, "helloworld");
});

test("Security - hash IP", () => {
  const security = new SecurityMiddleware();

  const first =
    security.hashIp("127.0.0.1");

  const second =
    security.hashIp("127.0.0.1");

  assert.equal(first, second);
  assert.ok(first.length > 0);
});

test("Security - safe path", () => {
  const security = new SecurityMiddleware();

  assert.equal(
    security.isSafePath("/api/users"),
    true,
  );

  assert.equal(
    security.isSafePath("/api/users/1"),
    true,
  );
});

test("Security - reject traversal path", () => {
  const security = new SecurityMiddleware();

  assert.equal(
    security.isSafePath("../etc/passwd"),
    false,
  );

  assert.equal(
    security.isSafePath("/api/../secret"),
    false,
  );
});

test("Security - request ID", () => {
  const security = new SecurityMiddleware();

  const result = security.validate({
    method: "GET",
    path: "/health",
    ip: "127.0.0.1",
  });

  assert.equal(result.allowed, true);
  assert.ok(result.requestId);
});

test("Security - required request ID", () => {
  const security = new SecurityMiddleware({
    requireRequestId: true,
  });

  const result = security.validate({
    method: "GET",
    path: "/api/test",
    headers: {},
  });

  assert.equal(result.allowed, false);
});

test("Security - provided request ID", () => {
  const security = new SecurityMiddleware({
    requireRequestId: true,
  });

  const result = security.validate({
    method: "GET",
    path: "/api/test",
    headers: {
      "x-request-id": "request-001",
    },
  });

  assert.equal(result.allowed, true);
  assert.equal(
    result.requestId,
    "request-001",
  );
});

// --------------------------------------------------
// RESULT
// --------------------------------------------------

console.log("");
console.log("========================================");
console.log("             TEST RESULT");
console.log("========================================");
console.log(`Total Tests : ${passed + failed}`);
console.log(`Passed      : ${passed}`);
console.log(`Failed      : ${failed}`);
console.log("========================================");
console.log("");

if (failed > 0) {
  process.exitCode = 1;
  console.log("MIDDLEWARE MOCK TEST FAILED");
} else {
  console.log(
    "ALL MIDDLEWARE MOCK TESTS PASSED ✓",
  );
}

console.log("");
