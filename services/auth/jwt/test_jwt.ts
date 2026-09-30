import assert from "node:assert/strict";

import {
  JwtService,
  encodeJwt,
  decodeJwt,
  validateJwt,
  isJwtValid,
} from "./index.js";

const SECRET =
  "test-secret-key-for-jwt-123456789";

let passed = 0;
let failed = 0;

function test(
  name: string,
  fn: () => void,
): void {
  try {
    fn();

    console.log(`? PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`? FAIL: ${name}`);

    if (error instanceof Error) {
      console.log(`  ${error.message}`);
    } else {
      console.log(`  ${String(error)}`);
    }

    failed++;
  }
}

console.log("");
console.log("========================================");
console.log("             JWT TEST");
console.log("========================================");
console.log("");

test("Encode JWT", () => {
  const token = encodeJwt(
    {
      userId: "user-001",
      role: "admin",
    },
    {
      secret: SECRET,
    },
  );

  assert.equal(
    token.split(".").length,
    3,
  );
});

test("Decode JWT", () => {
  const token = encodeJwt(
    {
      userId: "user-002",
      role: "user",
    },
    {
      secret: SECRET,
    },
  );

  const decoded = decodeJwt(token);

  assert.equal(
    decoded.header.alg,
    "HS256",
  );

  assert.equal(
    decoded.header.typ,
    "JWT",
  );

  assert.equal(
    decoded.payload.userId,
    "user-002",
  );

  assert.equal(
    decoded.payload.role,
    "user",
  );
});

test("Validate valid JWT", () => {
  const token = encodeJwt(
    {
      userId: "user-003",
    },
    {
      secret: SECRET,
      expiresInSeconds: 3600,
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
    },
  );

  assert.equal(result.valid, true);
  assert.ok(result.payload);
});

test("Reject invalid secret", () => {
  const token = encodeJwt(
    {
      userId: "user-004",
    },
    {
      secret: SECRET,
    },
  );

  const result = validateJwt(
    token,
    {
      secret:
        "different-secret-key-123456",
    },
  );

  assert.equal(result.valid, false);
  assert.equal(
    result.error,
    "Invalid JWT signature",
  );
});

test("Reject malformed token", () => {
  const result = validateJwt(
    "invalid-token",
    {
      secret: SECRET,
    },
  );

  assert.equal(result.valid, false);
});

test("Reject expired token", () => {
  const now = Math.floor(
    Date.now() / 1000,
  );

  const token = encodeJwt(
    {
      userId: "user-005",
      exp: now - 100,
    },
    {
      secret: SECRET,
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
    },
  );

  assert.equal(result.valid, false);
  assert.equal(
    result.error,
    "JWT has expired",
  );
});

test("Validate issuer", () => {
  const token = encodeJwt(
    {
      userId: "user-006",
    },
    {
      secret: SECRET,
      issuer: "modelnow",
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
      issuer: "modelnow",
    },
  );

  assert.equal(result.valid, true);
});

test("Reject invalid issuer", () => {
  const token = encodeJwt(
    {
      userId: "user-007",
    },
    {
      secret: SECRET,
      issuer: "modelnow",
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
      issuer: "another-service",
    },
  );

  assert.equal(result.valid, false);
  assert.equal(
    result.error,
    "Invalid JWT issuer",
  );
});

test("Validate audience", () => {
  const token = encodeJwt(
    {
      userId: "user-008",
    },
    {
      secret: SECRET,
      audience: "modelnow-api",
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
      audience: "modelnow-api",
    },
  );

  assert.equal(result.valid, true);
});

test("Reject invalid audience", () => {
  const token = encodeJwt(
    {
      userId: "user-009",
    },
    {
      secret: SECRET,
      audience: "modelnow-api",
    },
  );

  const result = validateJwt(
    token,
    {
      secret: SECRET,
      audience: "another-api",
    },
  );

  assert.equal(result.valid, false);
  assert.equal(
    result.error,
    "Invalid JWT audience",
  );
});

test("isJwtValid returns true", () => {
  const token = encodeJwt(
    {
      userId: "user-010",
    },
    {
      secret: SECRET,
      expiresInSeconds: 3600,
    },
  );

  assert.equal(
    isJwtValid(token, {
      secret: SECRET,
    }),
    true,
  );
});

test("JwtService sign and verify", () => {
  const service = new JwtService({
    secret: SECRET,
    issuer: "modelnow",
    audience: "api",
    expiresInSeconds: 3600,
  });

  const token = service.sign({
    userId: "user-011",
    role: "admin",
  });

  const result = service.verify(token);

  assert.equal(result.valid, true);
  assert.ok(result.payload);
  assert.equal(
    result.payload.userId,
    "user-011",
  );
  assert.equal(
    result.payload.role,
    "admin",
  );
});

test("JwtService decode", () => {
  const service = new JwtService({
    secret: SECRET,
  });

  const token = service.sign({
    userId: "user-012",
  });

  const decoded = service.decode(token);

  assert.equal(
    decoded.payload.userId,
    "user-012",
  );
});

test("JwtService isValid", () => {
  const service = new JwtService({
    secret: SECRET,
    expiresInSeconds: 3600,
  });

  const token = service.sign({
    userId: "user-013",
  });

  assert.equal(
    service.isValid(token),
    true,
  );
});

test("Reject weak JWT secret", () => {
  assert.throws(
    () =>
      new JwtService({
        secret: "short",
      }),
    /at least 16 characters/,
  );
});

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
  console.log("JWT TEST FAILED");
} else {
  console.log("ALL JWT TESTS PASSED ?");
}

console.log("");
