import assert from "node:assert/strict";
import test from "node:test";
import { ApiKeyGenerator } from "../generator.js";
import { ApiKeyManager } from "../manager.js";
import { ApiKeyRotationService } from "../rotation.js";
import { ApiKeyValidator } from "../validator.js";

test("API key generator", () => {
    const generator = new ApiKeyGenerator();

    const first = generator.generate();
    const second = generator.generate();

    assert.ok(first.id);
    assert.ok(first.key.startsWith("mn_"));
    assert.equal(first.prefix, "mn");
    assert.ok(first.createdAt instanceof Date);
    assert.notEqual(first.key, second.key);
    assert.notEqual(first.id, second.id);
});

test("API key manager creates and retrieves keys", () => {
    const manager = new ApiKeyManager();

    const created = manager.create({
        name: "Test Key",
        metadata: {
            environment: "test"
        }
    });

    assert.equal(created.record.name, "Test Key");
    assert.equal(created.record.metadata.environment, "test");
    assert.equal(manager.get(created.id)?.id, created.id);
    assert.equal(manager.list().length, 1);
});

test("API key validation succeeds for an active key", () => {
    const manager = new ApiKeyManager();
    const validator = new ApiKeyValidator(manager);

    const created = manager.create({
        name: "Validation Key"
    });

    const result = validator.validate(created.key);

    assert.equal(result.valid, true);
    assert.equal(result.record?.id, created.id);
});

test("invalid API key is rejected", () => {
    const manager = new ApiKeyManager();
    const validator = new ApiKeyValidator(manager);

    manager.create({
        name: "Validation Key"
    });

    const result = validator.validate("mn_invalid");

    assert.equal(result.valid, false);
    assert.equal(result.reason, "invalid");
});

test("revoked API key is rejected", () => {
    const manager = new ApiKeyManager();
    const validator = new ApiKeyValidator(manager);

    const created = manager.create({
        name: "Revoked Key"
    });

    assert.equal(manager.revoke(created.id), true);

    const result = validator.validate(created.key);

    assert.equal(result.valid, false);
    assert.equal(result.reason, "revoked");
});

test("expired API key is rejected", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const manager = new ApiKeyManager({
        now: () => now
    });
    const validator = new ApiKeyValidator(manager);

    const created = manager.create({
        name: "Expired Key",
        expiresAt: new Date("2026-01-02T00:00:00.000Z")
    });

    now.setTime(new Date("2026-01-03T00:00:00.000Z").getTime());

    const result = validator.validate(created.key);

    assert.equal(result.valid, false);
    assert.equal(result.reason, "expired");
});

test("API key rotation creates a replacement and revokes the old key", () => {
    const manager = new ApiKeyManager();
    const rotation = new ApiKeyRotationService(manager);

    const original = manager.create({
        name: "Production Key"
    });

    const result = rotation.rotate(original.id);

    assert.equal(result.oldKeyId, original.id);
    assert.notEqual(result.newKeyId, original.id);
    assert.ok(result.newKey);

    assert.equal(manager.get(original.id)?.revokedAt !== undefined, true);

    const validator = new ApiKeyValidator(manager);

    assert.equal(validator.isValid(original.key), false);
    assert.equal(validator.isValid(result.newKey), true);
});

test("API key deletion works", () => {
    const manager = new ApiKeyManager();

    const created = manager.create({
        name: "Delete Me"
    });

    assert.equal(manager.delete(created.id), true);
    assert.equal(manager.get(created.id), undefined);
    assert.equal(manager.delete(created.id), false);
});

test("API key names cannot be empty", () => {
    const manager = new ApiKeyManager();

    assert.throws(
        () => manager.create({ name: "   " }),
        /API key name is required/
    );
});

test("API key expiration must be in the future", () => {
    const manager = new ApiKeyManager({
        now: () => new Date("2026-01-01T00:00:00.000Z")
    });

    assert.throws(
        () =>
            manager.create({
                name: "Invalid Expiration",
                expiresAt: new Date("2025-12-31T23:59:59.000Z")
            }),
        /expiration must be in the future/
    );
});


