import test from "node:test";
import assert from "node:assert/strict";

import {
  AgentVersionService,
} from "./version-service.js";

import {
  InMemoryAgentVersionRepository,
} from "./version-repository.js";

import {
  AgentVersionNotFoundError,
  AgentVersionStateError,
  AgentVersionDuplicateError,
} from "./version-schema.js";

function createService(): AgentVersionService {
  return new AgentVersionService(
    new InMemoryAgentVersionRepository(),
  );
}

function createVersionInput(
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: "tenant-1",
    agentId: "agent-1",
    createdBy: "user-1",

    config: {
      model: {
        provider: "openai",
        name: "gpt-model",
        temperature: 0.2,
        maxTokens: 2048,
      },

      systemPrompt: "You are a helpful AI assistant.",

      tools: ["search", "calculator"],
    },

    description: "Initial agent version",

    ...overrides,
  };
}

test("should create an agent version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  assert.ok(version.id);
  assert.equal(version.tenantId, "tenant-1");
  assert.equal(version.agentId, "agent-1");
  assert.equal(version.version, 1);
  assert.equal(version.versionLabel, "v1");
  assert.equal(version.status, "draft");
  assert.ok(version.checksum);
});

test("should create sequential versions", async () => {
  const service = createService();

  const first = await service.createVersion(
    createVersionInput(),
  );

  const second = await service.createVersion(
    createVersionInput({
      config: {
        systemPrompt: "Updated system prompt",
      },
    }),
  );

  assert.equal(first.version, 1);
  assert.equal(second.version, 2);
  assert.equal(second.versionLabel, "v2");
});

test("should isolate version numbering between agents", async () => {
  const service = createService();

  const first = await service.createVersion(
    createVersionInput({
      agentId: "agent-1",
    }),
  );

  const second = await service.createVersion(
    createVersionInput({
      agentId: "agent-2",
    }),
  );

  assert.equal(first.version, 1);
  assert.equal(second.version, 1);
});

test("should reject invalid tenant ID", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.createVersion(
        createVersionInput({
          tenantId: "",
        }),
      ),
    /tenantId is required/,
  );
});

test("should reject invalid agent configuration", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.createVersion(
        createVersionInput({
          config: null,
        }),
      ),
    /config must be an object/,
  );
});

test("should retrieve a version by ID", async () => {
  const service = createService();

  const created = await service.createVersion(
    createVersionInput(),
  );

  const retrieved = await service.getVersion(
    "tenant-1",
    "agent-1",
    created.id,
  );

  assert.equal(retrieved.id, created.id);
});

test("should retrieve a version by number", async () => {
  const service = createService();

  await service.createVersion(createVersionInput());

  const second = await service.createVersion(
    createVersionInput(),
  );

  const retrieved = await service.getVersionByNumber(
    "tenant-1",
    "agent-1",
    2,
  );

  assert.equal(retrieved.id, second.id);
});

test("should return the latest version", async () => {
  const service = createService();

  await service.createVersion(createVersionInput());

  const second = await service.createVersion(
    createVersionInput(),
  );

  const latest = await service.getLatestVersion(
    "tenant-1",
    "agent-1",
  );

  assert.equal(latest.id, second.id);
  assert.equal(latest.version, 2);
});

test("should list versions in descending order", async () => {
  const service = createService();

  await service.createVersion(createVersionInput());

  await service.createVersion(createVersionInput());

  await service.createVersion(createVersionInput());

  const versions = await service.listVersions({
    tenantId: "tenant-1",
    agentId: "agent-1",
  });

  assert.equal(versions.length, 3);
  assert.deepEqual(
    versions.map((version) => version.version),
    [3, 2, 1],
  );
});

test("should enforce tenant isolation", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await assert.rejects(
    () =>
      service.getVersion(
        "tenant-2",
        "agent-1",
        version.id,
      ),
    AgentVersionNotFoundError,
  );
});

test("should publish a draft version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  const published = await service.publishVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  assert.equal(published.status, "published");
  assert.equal(published.publishedBy, "admin-1");
  assert.ok(published.publishedAt);
});

test("should not publish an already published version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await service.publishVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  await assert.rejects(
    () =>
      service.publishVersion(
        "tenant-1",
        "agent-1",
        version.id,
        "admin-1",
      ),
    AgentVersionStateError,
  );
});

test("should deprecate a published version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await service.publishVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  const deprecated = await service.deprecateVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  assert.equal(deprecated.status, "deprecated");
  assert.equal(deprecated.deprecatedBy, "admin-1");
  assert.ok(deprecated.deprecatedAt);
});

test("should not deprecate a draft version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await assert.rejects(
    () =>
      service.deprecateVersion(
        "tenant-1",
        "agent-1",
        version.id,
        "admin-1",
      ),
    AgentVersionStateError,
  );
});

test("should archive a draft version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  const archived = await service.archiveVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  assert.equal(archived.status, "archived");
  assert.equal(archived.archivedBy, "admin-1");
  assert.ok(archived.archivedAt);
});

test("should archive a published version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await service.publishVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  const archived = await service.archiveVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  assert.equal(archived.status, "archived");
});

test("should not archive an already archived version", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await service.archiveVersion(
    "tenant-1",
    "agent-1",
    version.id,
    "admin-1",
  );

  await assert.rejects(
    () =>
      service.archiveVersion(
        "tenant-1",
        "agent-1",
        version.id,
        "admin-1",
      ),
    AgentVersionStateError,
  );
});

test("should clone a version into a new draft", async () => {
  const service = createService();

  const original = await service.createVersion(
    createVersionInput(),
  );

  const cloned = await service.cloneVersion(
    "tenant-1",
    "agent-1",
    original.id,
    "user-2",
  );

  assert.equal(cloned.version, 2);
  assert.equal(cloned.status, "draft");
  assert.notEqual(cloned.id, original.id);
  assert.deepEqual(cloned.config, original.config);
  assert.equal(
    cloned.metadata?.clonedFromVersionId,
    original.id,
  );
});

test("should compare versions with identical configuration", async () => {
  const service = createService();

  const first = await service.createVersion(
    createVersionInput(),
  );

  const second = await service.createVersion(
    createVersionInput(),
  );

  const result = await service.compareVersions(
    "tenant-1",
    "agent-1",
    first.id,
    second.id,
  );

  assert.equal(result.sameConfiguration, true);
});

test("should compare versions with different configuration", async () => {
  const service = createService();

  const first = await service.createVersion(
    createVersionInput(),
  );

  const second = await service.createVersion(
    createVersionInput({
      config: {
        systemPrompt: "A different system prompt",
      },
    }),
  );

  const result = await service.compareVersions(
    "tenant-1",
    "agent-1",
    first.id,
    second.id,
  );

  assert.equal(result.sameConfiguration, false);
});

test("should prevent duplicate version numbers", async () => {
  const repository = new InMemoryAgentVersionRepository();

  const service = new AgentVersionService(repository);

  const version = await service.createVersion(
    createVersionInput(),
  );

  await assert.rejects(
    () => repository.create(version),
    AgentVersionDuplicateError,
  );
});

test("should not expose mutable configuration references", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  version.config.systemPrompt = "Modified externally";

  const retrieved = await service.getVersion(
    "tenant-1",
    "agent-1",
    version.id,
  );

  assert.equal(
    retrieved.config.systemPrompt,
    "You are a helpful AI assistant.",
  );
});

test("should filter versions by status", async () => {
  const service = createService();

  const draft = await service.createVersion(
    createVersionInput(),
  );

  const published = await service.createVersion(
    createVersionInput(),
  );

  await service.publishVersion(
    "tenant-1",
    "agent-1",
    published.id,
    "admin-1",
  );

  const drafts = await service.listVersions({
    tenantId: "tenant-1",
    agentId: "agent-1",
    status: "draft",
  });

  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].id, draft.id);
});

test("should reject missing actor during publishing", async () => {
  const service = createService();

  const version = await service.createVersion(
    createVersionInput(),
  );

  await assert.rejects(
    () =>
      service.publishVersion(
        "tenant-1",
        "agent-1",
        version.id,
        "",
      ),
    /Actor identity is required/,
  );
});