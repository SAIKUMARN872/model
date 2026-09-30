import assert from "node:assert/strict";

import {
  MfaService,
  TotpService,
  MfaVerificationService,
} from "./index.js";

console.log("");
console.log("========================================");
console.log("           MFA MOCK TEST");
console.log("========================================");
console.log("");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
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

test("MFA - setup factor", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "test-secret-123456",
  );

  assert.ok(setup.factorId);
  assert.equal(setup.userId, "user-001");
  assert.equal(setup.method, "totp");
  assert.equal(setup.enabled, false);
  assert.equal(setup.verified, false);
});

test("MFA - get factor", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "test-secret",
  );

  const factor = service.getById(setup.factorId);

  assert.ok(factor);
  assert.equal(factor.userId, "user-001");
});

test("MFA - get user factors", () => {
  const service = new MfaService();

  service.setup("user-001", "totp", "secret-1");
  service.setup("user-001", "totp", "secret-2");

  const factors = service.getUserFactors("user-001");

  assert.equal(factors.length, 2);
});

test("MFA - enable factor", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "secret",
  );

  const factor = service.enable(setup.factorId);

  assert.equal(factor.enabled, true);
  assert.equal(factor.verified, true);
});

test("MFA - disable factor", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "secret",
  );

  service.enable(setup.factorId);

  const factor = service.disable(setup.factorId);

  assert.equal(factor.enabled, false);
});

test("MFA - check enabled status", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "secret",
  );

  service.enable(setup.factorId);

  assert.equal(service.isEnabled("user-001"), true);
});

test("MFA - delete factor", () => {
  const service = new MfaService();

  const setup = service.setup(
    "user-001",
    "totp",
    "secret",
  );

  assert.equal(
    service.delete(setup.factorId),
    true,
  );

  assert.equal(
    service.getById(setup.factorId),
    undefined,
  );
});

test("TOTP - generate secret", () => {
  const totp = new TotpService();

  const secret = totp.generateSecret();

  assert.ok(secret);
  assert.ok(secret.length > 10);
});

test("TOTP - generate code", () => {
  const totp = new TotpService();

  const secret = totp.generateSecret();

  const code = totp.generate(
    secret,
    Date.now(),
  );

  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test("TOTP - verify valid code", () => {
  const totp = new TotpService();

  const secret = totp.generateSecret();
  const timestamp = Date.now();

  const code = totp.generate(
    secret,
    timestamp,
  );

  assert.equal(
    totp.verify(
      code,
      secret,
      timestamp,
    ),
    true,
  );
});

test("TOTP - reject invalid code", () => {
  const totp = new TotpService();

  const secret = totp.generateSecret();
  const timestamp = Date.now();

  const validCode = totp.generate(
    secret,
    timestamp,
  );

  const invalidCode =
    validCode === "000000"
      ? "111111"
      : "000000";

  assert.equal(
    totp.verify(
      invalidCode,
      secret,
      timestamp,
      0,
    ),
    false,
  );
});

test("TOTP - reject invalid length", () => {
  const totp = new TotpService();

  const secret = totp.generateSecret();

  assert.equal(
    totp.verify(
      "123",
      secret,
    ),
    false,
  );
});

test("Verification - successful TOTP", () => {
  const totp = new TotpService();
  const verification =
    new MfaVerificationService(totp);

  const secret = totp.generateSecret();
  const timestamp = Date.now();

  const code = totp.generate(
    secret,
    timestamp,
  );

  const result =
    verification.verifyTotp(
      "factor-001",
      "user-001",
      code,
      secret,
      timestamp,
    );

  assert.equal(result.verified, true);
  assert.equal(
    result.factorId,
    "factor-001",
  );
  assert.equal(
    result.userId,
    "user-001",
  );
  assert.ok(result.verificationId);
});

test("Verification - failed TOTP", () => {
  const totp = new TotpService();
  const verification =
    new MfaVerificationService(totp);

  const secret = totp.generateSecret();
  const timestamp = Date.now();

  const validCode = totp.generate(
    secret,
    timestamp,
  );

  const invalidCode =
    validCode === "000000"
      ? "111111"
      : "000000";

  const result =
    verification.verifyTotp(
      "factor-001",
      "user-001",
      invalidCode,
      secret,
      timestamp,
    );

  assert.equal(result.verified, false);
});

test("Verification - store record", () => {
  const totp = new TotpService();
  const verification =
    new MfaVerificationService(totp);

  const secret = totp.generateSecret();
  const timestamp = Date.now();

  const code = totp.generate(
    secret,
    timestamp,
  );

  const result =
    verification.verifyTotp(
      "factor-001",
      "user-001",
      code,
      secret,
      timestamp,
    );

  const record =
    verification.getVerification(
      result.verificationId,
    );

  assert.ok(record);
  assert.equal(record.userId, "user-001");
});

test("Verification - health check", () => {
  const verification =
    new MfaVerificationService();

  const health = verification.health();

  assert.equal(health.healthy, true);
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
  console.log("MFA MOCK TEST FAILED");
} else {
  console.log("ALL MFA MOCK TESTS PASSED ✓");
}

console.log("");
