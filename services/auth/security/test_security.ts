import {
  EncryptionService,
  KeyService,
} from "./index.js";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

function assertThrows(
  action: () => unknown,
  message: string,
): void {
  try {
    action();
    throw new Error(`Expected error: ${message}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === `Expected error: ${message}`
    ) {
      throw error;
    }

    console.log(`PASS: ${message}`);
  }
}

function runTests(): void {
  console.log("Running security tests...");

  const encryption = new EncryptionService(
    "test-encryption-secret-123456",
  );

  const original = "ModelNow confidential authentication data";

  const encrypted = encryption.encrypt(original);

  assert(
    encrypted.encrypted.length > 0,
    "Value is encrypted",
  );

  assert(
    encrypted.iv.length > 0,
    "IV is generated",
  );

  assert(
    encrypted.authTag.length > 0,
    "Authentication tag is generated",
  );

  const decrypted = encryption.decrypt(encrypted);

  assert(
    decrypted === original,
    "Encrypted value can be decrypted",
  );

  const encryptedText = encryption.encryptText(original);

  assert(
    encryptedText.split(".").length === 3,
    "Encrypted text has valid format",
  );

  assert(
    encryption.decryptText(encryptedText) === original,
    "Encrypted text can be decrypted",
  );

  assert(
    encryption.hash("hello") === encryption.hash("hello"),
    "Hash is deterministic",
  );

  assert(
    encryption.hash("hello") !== encryption.hash("world"),
    "Different values produce different hashes",
  );

  assert(
    encryption.isValid(encryptedText),
    "Valid encrypted text is recognized",
  );

  assertThrows(
    () => encryption.decryptText("invalid"),
    "Invalid encrypted text is rejected",
  );

  const keys = new KeyService();

  const apiKey = keys.create({
    name: "Test API Key",
    type: "api",
  });

  assert(
    apiKey.id.length > 0,
    "Security key ID is generated",
  );

  assert(
    apiKey.value.length > 0,
    "Security key value is generated",
  );

  assert(
    apiKey.active,
    "New security key is active",
  );

  assert(
    keys.verify(apiKey.id, apiKey.value),
    "Security key verification works",
  );

  assert(
    !keys.verify(apiKey.id, "wrong-value"),
    "Invalid security key is rejected",
  );

  assert(
    keys.get(apiKey.id)?.name === "Test API Key",
    "Security key lookup works",
  );

  const encryptionKey = keys.create({
    name: "Encryption Key",
    type: "encryption",
  });

  assert(
    keys.count() === 2,
    "Security key count is correct",
  );

  assert(
    keys.getActive().length === 2,
    "Active security keys are returned",
  );

  assert(
    keys.revoke(apiKey.id),
    "Security key can be revoked",
  );

  assert(
    !keys.verify(apiKey.id, apiKey.value),
    "Revoked security key cannot be verified",
  );

  assert(
    keys.getActive().length === 1,
    "Revoked key is excluded from active keys",
  );

  assert(
    keys.delete(encryptionKey.id),
    "Security key can be deleted",
  );

  assert(
    keys.count() === 1,
    "Deleted key is removed",
  );

  const health = keys.health();

  assert(
    health.healthy,
    "Security key service is healthy",
  );

  keys.clear();

  assert(
    keys.count() === 0,
    "Security keys can be cleared",
  );

  console.log("All security tests passed.");
}

runTests();
