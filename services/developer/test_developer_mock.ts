import test from "node:test";
import assert from "node:assert/strict";

import {
  ApiKeyRepository,
  ApiKeyService,
  validateCreateApiKeyInput,
  UsageRepository,
  UsageService,
  validateCreateApiUsageInput,
  SettingsRepository,
  SettingsService,
  validateUpdateDeveloperSettingsInput,
  ProjectRepository,
  ProjectService,
  validateCreateProjectInput,
  validateUpdateProjectInput,
  SdkRepository,
  SdkService,
  validateCreateSdkReleaseInput,
  WebhookRepository,
  WebhookService,
  validateCreateWebhookInput,
  validateUpdateWebhookInput,
} from "./index.js";

import type { ApiKey } from "./api_keys/api-key-schema.js";
import type { ApiUsage } from "./api_usage/usage-schema.js";
import type { DeveloperProject } from "./projects/project-schema.js";
import type { SdkRelease } from "./sdk_management/sdk-schema.js";
import type { Webhook } from "./webhooks/webhook-schema.js";

function sampleApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: "key-1",
    ownerId: "owner-1",
    name: "Test key",
    prefix: "abcd1234",
    keyHash: "test-hash",
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function sampleUsage(overrides: Partial<ApiUsage> = {}): ApiUsage {
  return {
    id: "usage-1",
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
    units: 1,
    durationMs: 20,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function sampleProject(overrides: Partial<DeveloperProject> = {}): DeveloperProject {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "project-1",
    ownerId: "owner-1",
    name: "Test project",
    description: "Project description",
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function sampleSdk(overrides: Partial<SdkRelease> = {}): SdkRelease {
  return {
    id: "sdk-1",
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
    status: "available",
    releasedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function sampleWebhook(overrides: Partial<Webhook> = {}): Webhook {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "webhook-1",
    ownerId: "owner-1",
    url: "https://example.com/webhook",
    events: ["project.created"],
    secret: "test-secret",
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// API key schema

test("API key schema accepts valid input", () => {
  assert.doesNotThrow(() => validateCreateApiKeyInput({
    ownerId: "owner-1",
    name: "Development key",
  }));
});

test("API key schema rejects blank owner ID", () => {
  assert.throws(() => validateCreateApiKeyInput({
    ownerId: " ",
    name: "Development key",
  }));
});

test("API key schema rejects blank name", () => {
  assert.throws(() => validateCreateApiKeyInput({
    ownerId: "owner-1",
    name: " ",
  }));
});

test("API key schema rejects invalid expiration date", () => {
  assert.throws(() => validateCreateApiKeyInput({
    ownerId: "owner-1",
    name: "Development key",
    expiresAt: new Date(Number.NaN),
  }));
});

// API key repository and service

test("API key repository saves and retrieves a key", () => {
  const repository = new ApiKeyRepository();
  repository.save(sampleApiKey());
  assert.equal(repository.getById("key-1")?.name, "Test key");
});

test("API key repository filters keys by owner", () => {
  const repository = new ApiKeyRepository();
  repository.save(sampleApiKey());
  repository.save(sampleApiKey({ id: "key-2", ownerId: "owner-2" }));
  assert.equal(repository.listByOwner("owner-1").length, 1);
});

test("API key repository finds by hash", () => {
  const repository = new ApiKeyRepository();
  repository.save(sampleApiKey());
  assert.equal(repository.findByHash("test-hash")?.id, "key-1");
  assert.equal(repository.findByHash("missing"), undefined);
});

test("API key repository clones returned dates", () => {
  const repository = new ApiKeyRepository();
  repository.save(sampleApiKey());
  repository.getById("key-1")!.createdAt.setFullYear(2000);
  assert.equal(repository.getById("key-1")!.createdAt.getUTCFullYear(), 2026);
});

test("API key repository deletes keys", () => {
  const repository = new ApiKeyRepository();
  repository.save(sampleApiKey());
  assert.equal(repository.delete("key-1"), true);
  assert.equal(repository.delete("key-1"), false);
});

test("API key service creates a secret and stores only its hash", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  const created = service.create({ ownerId: "owner-1", name: "Test key" });

  assert.ok(created.secret.length > 20);
  assert.equal(created.record.status, "active");
  assert.equal(created.record.ownerId, "owner-1");
  assert.equal(created.record.name, "Test key");
  assert.ok(created.record.keyHash);
  assert.notEqual(created.record.keyHash, created.secret);
});

test("API key service authenticates a valid secret", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  const created = service.create({ ownerId: "owner-1", name: "Test key" });

  const authenticated = service.authenticate(created.secret);
  assert.equal(authenticated?.id, created.record.id);
  assert.ok(authenticated?.lastUsedAt instanceof Date);
});

test("API key service rejects an unknown secret", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  assert.equal(service.authenticate("unknown-secret"), undefined);
});

test("API key service rejects revoked keys", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  const created = service.create({ ownerId: "owner-1", name: "Test key" });
  service.revoke(created.record.id, "owner-1");
  assert.equal(service.authenticate(created.secret), undefined);
});

test("API key service rejects expired keys", () => {
  const repository = new ApiKeyRepository();
  const service = new ApiKeyService(repository);
  const created = service.create({
    ownerId: "owner-1",
    name: "Expired key",
    expiresAt: new Date(Date.now() - 60_000),
  });
  assert.equal(service.authenticate(created.secret), undefined);
});

test("API key service lists keys for an owner", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  service.create({ ownerId: "owner-1", name: "Key one" });
  service.create({ ownerId: "owner-1", name: "Key two" });
  service.create({ ownerId: "owner-2", name: "Other key" });
  assert.equal(service.list("owner-1").length, 2);
});

test("API key service prevents revocation by another owner", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  const created = service.create({ ownerId: "owner-1", name: "Test key" });
  assert.throws(() => service.revoke(created.record.id, "owner-2"));
});

test("API key service deletes keys only for their owner", () => {
  const service = new ApiKeyService(new ApiKeyRepository());
  const created = service.create({ ownerId: "owner-1", name: "Test key" });
  assert.throws(() => service.delete(created.record.id, "owner-2"));
  assert.equal(service.delete(created.record.id, "owner-1"), true);
});

// API usage schema

test("usage schema accepts valid input", () => {
  assert.doesNotThrow(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
  }));
});

test("usage schema rejects blank owner", () => {
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: " ",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
  }));
});

test("usage schema rejects blank endpoint and method", () => {
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: " ",
    method: "GET",
    statusCode: 200,
  }));
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: " ",
    statusCode: 200,
  }));
});

test("usage schema rejects invalid status codes", () => {
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 99,
  }));
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 600,
  }));
});

test("usage schema rejects negative units and duration", () => {
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
    units: -1,
  }));
  assert.throws(() => validateCreateApiUsageInput({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
    durationMs: -1,
  }));
});

// API usage repository and service

test("usage repository saves and retrieves records", () => {
  const repository = new UsageRepository();
  repository.save(sampleUsage());
  assert.equal(repository.getById("usage-1")?.statusCode, 200);
});

test("usage repository filters by owner", () => {
  const repository = new UsageRepository();
  repository.save(sampleUsage());
  repository.save(sampleUsage({ id: "usage-2", ownerId: "owner-2" }));
  assert.equal(repository.listByOwner("owner-1").length, 1);
});

test("usage repository clones dates", () => {
  const repository = new UsageRepository();
  repository.save(sampleUsage());
  repository.getById("usage-1")!.createdAt.setFullYear(2000);
  assert.equal(repository.getById("usage-1")!.createdAt.getUTCFullYear(), 2026);
});

test("usage repository deletes records", () => {
  const repository = new UsageRepository();
  repository.save(sampleUsage());
  assert.equal(repository.delete("usage-1"), true);
  assert.equal(repository.getById("usage-1"), undefined);
});

test("usage service records normalized request data", () => {
  const service = new UsageService(new UsageRepository());
  const usage = service.record({
    ownerId: "owner-1",
    endpoint: " /v1/test ",
    method: "get",
    statusCode: 200,
  });
  assert.equal(usage.endpoint, "/v1/test");
  assert.equal(usage.method, "GET");
  assert.equal(usage.units, 1);
  assert.equal(usage.durationMs, 0);
});

test("usage service calculates totals and errors", () => {
  const service = new UsageService(new UsageRepository());
  service.record({
    ownerId: "owner-1",
    endpoint: "/ok",
    method: "GET",
    statusCode: 200,
    units: 3,
  });
  service.record({
    ownerId: "owner-1",
    endpoint: "/error",
    method: "POST",
    statusCode: 500,
    units: 2,
  });
  service.record({
    ownerId: "owner-2",
    endpoint: "/other",
    method: "GET",
    statusCode: 200,
  });

  assert.deepEqual(service.getTotals("owner-1"), {
    requests: 2,
    units: 5,
    errors: 1,
  });
});

test("usage service retrieves usage and lists by owner", () => {
  const service = new UsageService(new UsageRepository());
  const usage = service.record({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 200,
  });
  assert.equal(service.get(usage.id)?.id, usage.id);
  assert.equal(service.list("owner-1").length, 1);
});

test("usage service rejects invalid usage input", () => {
  const service = new UsageService(new UsageRepository());
  assert.throws(() => service.record({
    ownerId: "owner-1",
    endpoint: "/v1/test",
    method: "GET",
    statusCode: 99,
  }));
});

// Developer settings

test("settings schema accepts valid updates", () => {
  assert.doesNotThrow(() => validateUpdateDeveloperSettingsInput({
    notificationsEnabled: false,
    usageAlertsEnabled: true,
    monthlyLimit: 100,
  }));
});

test("settings schema rejects negative monthly limit", () => {
  assert.throws(() => validateUpdateDeveloperSettingsInput({ monthlyLimit: -1 }));
});

test("settings repository saves and retrieves by owner", () => {
  const repository = new SettingsRepository();
  const service = new SettingsService(repository);
  const settings = service.getOrCreate("owner-1");
  assert.equal(repository.getByOwner("owner-1")?.id, settings.id);
});

test("settings service creates default settings once", () => {
  const service = new SettingsService(new SettingsRepository());
  const first = service.getOrCreate("owner-1");
  const second = service.getOrCreate("owner-1");
  assert.equal(first.id, second.id);
  assert.equal(first.notificationsEnabled, true);
  assert.equal(first.usageAlertsEnabled, true);
});

test("settings service rejects blank owner", () => {
  const service = new SettingsService(new SettingsRepository());
  assert.throws(() => service.getOrCreate(" "));
});

test("settings service updates supplied fields", () => {
  const service = new SettingsService(new SettingsRepository());
  const updated = service.update("owner-1", {
    notificationsEnabled: false,
    monthlyLimit: 250,
    defaultProjectId: "project-1",
  });
  assert.equal(updated.notificationsEnabled, false);
  assert.equal(updated.monthlyLimit, 250);
  assert.equal(updated.defaultProjectId, "project-1");
});

test("settings service clears monthly limit with null", () => {
  const service = new SettingsService(new SettingsRepository());
  service.update("owner-1", { monthlyLimit: 250 });
  const updated = service.update("owner-1", { monthlyLimit: null });
  assert.equal(updated.monthlyLimit, undefined);
});

test("settings service deletes settings", () => {
  const service = new SettingsService(new SettingsRepository());
  service.getOrCreate("owner-1");
  assert.equal(service.delete("owner-1"), true);
  assert.equal(service.delete("owner-1"), false);
});

// Projects

test("project schema accepts valid creation input", () => {
  assert.doesNotThrow(() => validateCreateProjectInput({
    ownerId: "owner-1",
    name: "My project",
  }));
});

test("project schema rejects missing owner or blank name", () => {
  assert.throws(() => validateCreateProjectInput({ ownerId: " ", name: "Project" }));
  assert.throws(() => validateCreateProjectInput({ ownerId: "owner-1", name: " " }));
});

test("project schema validates update input", () => {
  assert.doesNotThrow(() => validateUpdateProjectInput({
    name: "Updated",
    status: "archived",
  }));
  assert.throws(() => validateUpdateProjectInput({ name: " " }));
});

test("project repository saves, gets, lists and deletes", () => {
  const repository = new ProjectRepository();
  repository.save(sampleProject());
  assert.equal(repository.getById("project-1")?.name, "Test project");
  assert.equal(repository.listByOwner("owner-1").length, 1);
  assert.equal(repository.delete("project-1"), true);
  assert.equal(repository.getById("project-1"), undefined);
});

test("project service creates normalized project", () => {
  const service = new ProjectService(new ProjectRepository());
  const project = service.create({
    ownerId: "owner-1",
    name: "  Project A ",
    description: "  A description ",
  });
  assert.equal(project.name, "Project A");
  assert.equal(project.description, "A description");
  assert.equal(project.status, "active");
});

test("project service scopes listing by owner", () => {
  const service = new ProjectService(new ProjectRepository());
  service.create({ ownerId: "owner-1", name: "One" });
  service.create({ ownerId: "owner-2", name: "Two" });
  assert.equal(service.list("owner-1").length, 1);
});

test("project service prevents cross-owner access", () => {
  const service = new ProjectService(new ProjectRepository());
  const project = service.create({ ownerId: "owner-1", name: "One" });
  assert.throws(() => service.get(project.id, "owner-2"));
});

test("project service updates project", () => {
  const service = new ProjectService(new ProjectRepository());
  const project = service.create({ ownerId: "owner-1", name: "Old name" });
  const updated = service.update(project.id, "owner-1", {
    name: "New name",
    status: "archived",
  });
  assert.equal(updated.name, "New name");
  assert.equal(updated.status, "archived");
});

test("project service rejects update for missing project", () => {
  const service = new ProjectService(new ProjectRepository());
  assert.throws(() => service.update("missing", "owner-1", { name: "New" }));
});

test("project service deletes project with correct owner", () => {
  const service = new ProjectService(new ProjectRepository());
  const project = service.create({ ownerId: "owner-1", name: "Project" });
  assert.equal(service.delete(project.id, "owner-1"), true);
  assert.equal(service.delete(project.id, "owner-1"), false);
});

// SDK management

test("SDK schema accepts valid release input", () => {
  assert.doesNotThrow(() => validateCreateSdkReleaseInput({
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  }));
});

test("SDK schema rejects missing required fields", () => {
  assert.throws(() => validateCreateSdkReleaseInput({
    name: " ",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  }));
});

test("SDK repository saves and retrieves release", () => {
  const repository = new SdkRepository();
  repository.save(sampleSdk());
  assert.equal(repository.getById("sdk-1")?.version, "1.0.0");
});

test("SDK repository finds package version", () => {
  const repository = new SdkRepository();
  repository.save(sampleSdk());
  assert.equal(
    repository.findByPackageAndVersion("@example/sdk", "1.0.0")?.id,
    "sdk-1",
  );
});

test("SDK repository lists and deletes releases", () => {
  const repository = new SdkRepository();
  repository.save(sampleSdk());
  assert.equal(repository.list().length, 1);
  assert.equal(repository.delete("sdk-1"), true);
  assert.equal(repository.list().length, 0);
});

test("SDK service registers release", () => {
  const service = new SdkService(new SdkRepository());
  const release = service.register({
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  });
  assert.equal(release.status, "available");
  assert.equal(release.version, "1.0.0");
});

test("SDK service rejects duplicate package versions", () => {
  const service = new SdkService(new SdkRepository());
  const input = {
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  };
  service.register(input);
  assert.throws(() => service.register(input), /already exists/);
});

test("SDK service deprecates a release", () => {
  const service = new SdkService(new SdkRepository());
  const release = service.register({
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  });
  assert.equal(service.deprecate(release.id).status, "deprecated");
});

test("SDK service rejects deprecation of missing release", () => {
  const service = new SdkService(new SdkRepository());
  assert.throws(() => service.deprecate("missing"));
});

test("SDK service gets, lists and deletes releases", () => {
  const service = new SdkService(new SdkRepository());
  const release = service.register({
    name: "Example SDK",
    language: "TypeScript",
    version: "1.0.0",
    packageName: "@example/sdk",
  });
  assert.equal(service.get(release.id)?.id, release.id);
  assert.equal(service.list().length, 1);
  assert.equal(service.delete(release.id), true);
});

// Webhooks

test("webhook schema accepts valid input", () => {
  assert.doesNotThrow(() => validateCreateWebhookInput({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  }));
});

test("webhook schema rejects blank owner", () => {
  assert.throws(() => validateCreateWebhookInput({
    ownerId: " ",
    url: "https://example.com/hook",
    events: ["project.created"],
  }));
});

test("webhook schema rejects invalid URL and protocol", () => {
  assert.throws(() => validateCreateWebhookInput({
    ownerId: "owner-1",
    url: "not-a-url",
    events: ["project.created"],
  }));
  assert.throws(() => validateCreateWebhookInput({
    ownerId: "owner-1",
    url: "file:///tmp/hook",
    events: ["project.created"],
  }));
});

test("webhook schema rejects empty events", () => {
  assert.throws(() => validateCreateWebhookInput({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: [],
  }));
});

test("webhook schema validates updates", () => {
  assert.doesNotThrow(() => validateUpdateWebhookInput({
    status: "disabled",
    events: ["project.updated"],
  }));
  assert.throws(() => validateUpdateWebhookInput({ status: "invalid" as "active" }));
});

test("webhook repository saves and retrieves webhook", () => {
  const repository = new WebhookRepository();
  repository.save(sampleWebhook());
  assert.equal(repository.getById("webhook-1")?.url, "https://example.com/webhook");
});

test("webhook repository filters by owner", () => {
  const repository = new WebhookRepository();
  repository.save(sampleWebhook());
  repository.save(sampleWebhook({ id: "webhook-2", ownerId: "owner-2" }));
  assert.equal(repository.listByOwner("owner-1").length, 1);
});

test("webhook repository clones event arrays", () => {
  const repository = new WebhookRepository();
  repository.save(sampleWebhook());
  repository.getById("webhook-1")!.events.push("mutated.event");
  assert.deepEqual(repository.getById("webhook-1")!.events, ["project.created"]);
});

test("webhook repository deletes webhook", () => {
  const repository = new WebhookRepository();
  repository.save(sampleWebhook());
  assert.equal(repository.delete("webhook-1"), true);
  assert.equal(repository.getById("webhook-1"), undefined);
});

test("webhook service creates webhook with secret", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created", "project.created"],
  });
  assert.ok(webhook.secret.length > 20);
  assert.deepEqual(webhook.events, ["project.created"]);
  assert.equal(webhook.status, "active");
});

test("webhook service lists by owner", () => {
  const service = new WebhookService(new WebhookRepository());
  service.create({
    ownerId: "owner-1",
    url: "https://example.com/one",
    events: ["project.created"],
  });
  service.create({
    ownerId: "owner-2",
    url: "https://example.com/two",
    events: ["project.created"],
  });
  assert.equal(service.list("owner-1").length, 1);
});

test("webhook service prevents cross-owner access", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  });
  assert.throws(() => service.get(webhook.id, "owner-2"));
});

test("webhook service updates events and status", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  });
  const updated = service.update(webhook.id, "owner-1", {
    events: ["project.updated"],
    status: "disabled",
  });
  assert.deepEqual(updated.events, ["project.updated"]);
  assert.equal(updated.status, "disabled");
});

test("webhook service signs payload consistently", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  });
  const first = service.signPayload(webhook.id, "owner-1", '{"ok":true}');
  const second = service.signPayload(webhook.id, "owner-1", '{"ok":true}');
  const other = service.signPayload(webhook.id, "owner-1", '{"ok":false}');

  assert.equal(first, second);
  assert.notEqual(first, other);
});

test("webhook service prevents signing for another owner", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  });
  assert.throws(() => service.signPayload(webhook.id, "owner-2", "payload"));
});

test("webhook service deletes webhook for its owner", () => {
  const service = new WebhookService(new WebhookRepository());
  const webhook = service.create({
    ownerId: "owner-1",
    url: "https://example.com/hook",
    events: ["project.created"],
  });
  assert.equal(service.delete(webhook.id, "owner-1"), true);
  assert.equal(service.delete(webhook.id, "owner-1"), false);
});
