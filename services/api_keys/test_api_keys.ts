import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  generateApiKey,
  hashApiKey,
} from "./generator.js";

import {
  ApiKeyManager,
} from "./manager.js";

import {
  ApiKeyRotation,
} from "./rotation.js";

import {
  ApiKeyValidator,
} from "./validator.js";

test("generate API key", () => {
  const generated =
    generateApiKey();

  assert.ok(generated.key);
  assert.ok(generated.keyId);
  assert.ok(generated.hash);
  assert.ok(
    generated.key.startsWith("mn_"),
  );

  assert.equal(
    generated.hash,
    hashApiKey(generated.key),
  );
});

test("generate API key with custom prefix", () => {
  const generated =
    generateApiKey({
      prefix: "prod",
    });

  assert.ok(
    generated.key.startsWith("prod_"),
  );

  assert.equal(
    generated.prefix,
    "prod",
  );
});

test("generator rejects small key size", () => {
  assert.throws(
    () =>
      generateApiKey({
        bytes: 8,
      }),
    /at least 16/,
  );
});

test("manager creates API key", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Test Key",
      subject: "user-1",
      scopes: [
        "users:read",
        "users:write",
      ],
    });

  assert.ok(generated.key);
  assert.ok(generated.keyId);

  const record =
    manager.get(generated.keyId);

  assert.ok(record);
  assert.equal(
    record?.name,
    "Test Key",
  );
  assert.equal(
    record?.subject,
    "user-1",
  );
});

test("manager validates API key", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Test Key",
      subject: "user-1",
    });

  const result =
    manager.validate(
      generated.key,
    );

  assert.equal(result.valid, true);
  assert.equal(
    result.record?.subject,
    "user-1",
  );
});

test("invalid API key is rejected", () => {
  const manager =
    new ApiKeyManager();

  const result =
    manager.validate(
      "invalid-api-key",
    );

  assert.equal(result.valid, false);
});

test("API key can be revoked", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Revocable",
      subject: "user-1",
    });

  manager.revoke(
    generated.keyId,
  );

  const result =
    manager.validate(
      generated.key,
    );

  assert.equal(result.valid, false);
  assert.equal(
    result.reason,
    "API key has been revoked",
  );
});

test("API key can be activated again", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Reusable",
      subject: "user-1",
    });

  manager.revoke(
    generated.keyId,
  );

  manager.activate(
    generated.keyId,
  );

  const result =
    manager.validate(
      generated.key,
    );

  assert.equal(result.valid, true);
});

test("API key scope validation works", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Scoped Key",
      subject: "user-1",
      scopes: [
        "users:read",
      ],
    });

  assert.equal(
    manager.hasScope(
      generated.key,
      "users:read",
    ),
    true,
  );

  assert.equal(
    manager.hasScope(
      generated.key,
      "users:delete",
    ),
    false,
  );
});

test("validator accepts required scope", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Scoped",
      subject: "service-a",
      scopes: [
        "models:read",
        "models:execute",
      ],
    });

  const validator =
    new ApiKeyValidator(
      manager,
    );

  const result =
    validator.validate({
      key: generated.key,
      requiredScopes: [
        "models:execute",
      ],
    });

  assert.equal(result.valid, true);
  assert.equal(
    result.authenticated,
    true,
  );
  assert.equal(
    result.subject,
    "service-a",
  );
});

test("validator rejects missing scope", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Scoped",
      subject: "service-a",
      scopes: [
        "models:read",
      ],
    });

  const validator =
    new ApiKeyValidator(
      manager,
    );

  const result =
    validator.validate({
      key: generated.key,
      requiredScopes: [
        "models:execute",
      ],
    });

  assert.equal(result.valid, false);
  assert.equal(
    result.authenticated,
    true,
  );
  assert.equal(
    result.reason,
    "Required scope is missing",
  );
});

test("validator rejects invalid prefix", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Production",
      subject: "service-a",
      prefix: "prod",
    });

  const validator =
    new ApiKeyValidator(
      manager,
      {
        requiredPrefix: "test",
      },
    );

  const result =
    validator.validate({
      key: generated.key,
    });

  assert.equal(result.valid, false);
  assert.equal(
    result.reason,
    "Invalid API key prefix",
  );
});

test("validator fingerprint is deterministic", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Fingerprint",
      subject: "user-1",
    });

  const validator =
    new ApiKeyValidator(
      manager,
    );

  const first =
    validator.fingerprint(
      generated.key,
    );

  const second =
    validator.fingerprint(
      generated.key,
    );

  assert.equal(first, second);
  assert.equal(first.length, 16);
});

test("API key update works", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Original",
      subject: "user-1",
    });

  const updated =
    manager.update(
      generated.keyId,
      {
        name: "Updated",
        scopes: ["read"],
      },
    );

  assert.equal(
    updated.name,
    "Updated",
  );

  assert.deepEqual(
    updated.scopes,
    ["read"],
  );
});

test("get keys by subject works", () => {
  const manager =
    new ApiKeyManager();

  manager.create({
    name: "Key 1",
    subject: "user-1",
  });

  manager.create({
    name: "Key 2",
    subject: "user-1",
  });

  manager.create({
    name: "Key 3",
    subject: "user-2",
  });

  const keys =
    manager.getBySubject(
      "user-1",
    );

  assert.equal(keys.length, 2);
});

test("API key rotation creates replacement key", () => {
  const manager =
    new ApiKeyManager();

  const oldKey =
    manager.create({
      name: "Production Key",
      subject: "service-a",
      scopes: [
        "models:read",
      ],
    });

  const rotation =
    new ApiKeyRotation(
      manager,
    );

  const result =
    rotation.rotate(
      oldKey.keyId,
    );

  assert.equal(
    result.oldKeyId,
    oldKey.keyId,
  );

  assert.ok(
    result.newKey.key,
  );

  assert.equal(
    result.oldKeyRevoked,
    true,
  );

  const oldValidation =
    manager.validate(
      oldKey.key,
    );

  assert.equal(
    oldValidation.valid,
    false,
  );

  const newValidation =
    manager.validate(
      result.newKey.key,
    );

  assert.equal(
    newValidation.valid,
    true,
  );
});

test("rotation can keep old key temporarily active", () => {
  const manager =
    new ApiKeyManager();

  const oldKey =
    manager.create({
      name: "Temporary Rotation",
      subject: "service-a",
    });

  const rotation =
    new ApiKeyRotation(
      manager,
    );

  const result =
    rotation.rotateWithoutImmediateRevoke(
      oldKey.keyId,
    );

  assert.equal(
    result.oldKeyRevoked,
    false,
  );

  assert.equal(
    manager.validate(
      oldKey.key,
    ).valid,
    true,
  );

  assert.equal(
    manager.validate(
      result.newKey.key,
    ).valid,
    true,
  );
});

test("old key can be revoked after rotation", () => {
  const manager =
    new ApiKeyManager();

  const oldKey =
    manager.create({
      name: "Delayed Revoke",
      subject: "service-a",
    });

  const rotation =
    new ApiKeyRotation(
      manager,
    );

  rotation.rotateWithoutImmediateRevoke(
    oldKey.keyId,
  );

  rotation.revokeOldKey(
    oldKey.keyId,
  );

  assert.equal(
    manager.validate(
      oldKey.key,
    ).valid,
    false,
  );
});

test("manager health works", () => {
  const manager =
    new ApiKeyManager();

  manager.create({
    name: "Health Key",
    subject: "service-a",
  });

  const health =
    manager.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.keyCount,
    1,
  );
});

test("validator health works", () => {
  const manager =
    new ApiKeyManager();

  const validator =
    new ApiKeyValidator(
      manager,
    );

  const health =
    validator.health();

  assert.equal(
    health.healthy,
    true,
  );
});

test("rotation health works", () => {
  const manager =
    new ApiKeyManager();

  const rotation =
    new ApiKeyRotation(
      manager,
    );

  const health =
    rotation.health();

  assert.equal(
    health.healthy,
    true,
  );
});

test("manager delete works", () => {
  const manager =
    new ApiKeyManager();

  const generated =
    manager.create({
      name: "Delete Me",
      subject: "user-1",
    });

  assert.equal(
    manager.delete(
      generated.keyId,
    ),
    true,
  );

  assert.equal(
    manager.get(
      generated.keyId,
    ),
    undefined,
  );
});

test("manager clear works", () => {
  const manager =
    new ApiKeyManager();

  manager.create({
    name: "Key 1",
    subject: "user-1",
  });

  manager.create({
    name: "Key 2",
    subject: "user-2",
  });

  manager.clear();

  assert.equal(
    manager.size(),
    0,
  );
});