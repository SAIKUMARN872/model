import {
  PasswordHasher,
  PasswordResetService,
  PasswordValidator,
} from "./index.js";

let passed = 0;
let failed = 0;

function test(
  name: string,
  condition: boolean,
): void {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.log(`FAIL: ${name}`);
    failed++;
  }
}

async function runTests(): Promise<void> {
  console.log("Running password tests...\n");

  const validator = new PasswordValidator();

  test(
    "Valid password passes validation",
    validator.isValid("Strong@123"),
  );

  test(
    "Short password fails validation",
    !validator.isValid("Aa1@"),
  );

  test(
    "Missing uppercase fails validation",
    !validator.isValid("strong@123"),
  );

  test(
    "Missing lowercase fails validation",
    !validator.isValid("STRONG@123"),
  );

  test(
    "Missing number fails validation",
    !validator.isValid("Strong@abc"),
  );

  test(
    "Missing special character fails validation",
    !validator.isValid("Strong123"),
  );

  test(
    "Whitespace fails validation",
    !validator.isValid("Strong @123"),
  );

  const hasher = new PasswordHasher();

  const result = await hasher.hash("Strong@123");

  test(
    "Password hash is generated",
    result.hash.length > 0,
  );

  test(
    "Password salt is generated",
    result.salt.length > 0,
  );

  test(
    "Hash algorithm is scrypt",
    result.algorithm === "scrypt",
  );

  test(
    "Correct password verifies",
    await hasher.verify("Strong@123", result),
  );

  test(
    "Incorrect password fails verification",
    !(await hasher.verify("Wrong@123", result)),
  );

  const resetService = new PasswordResetService();

  const resetToken =
    resetService.createToken("user-123");

  test(
    "Reset token is created",
    resetToken.token.length > 0,
  );

  test(
    "Reset token verifies",
    resetService.verifyToken(resetToken.token) !== null,
  );

  const consumed =
    resetService.consumeToken(resetToken.token);

  test(
    "Reset token can be consumed",
    consumed !== null && consumed.used,
  );

  test(
    "Consumed token cannot be verified again",
    resetService.verifyToken(resetToken.token) === null,
  );

  console.log(`\nTests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log("\nAll password tests passed.");
  }
}

void runTests();
