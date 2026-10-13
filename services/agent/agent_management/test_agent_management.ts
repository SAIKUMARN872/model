import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  AgentManagementService,
  AgentManagementError,
  InMemoryAgentRepository,
} from "./index.js";

function createService(): AgentManagementService {
  return new AgentManagementService(
    new InMemoryAgentRepository(),
  );
}

function validAgentInput() {
  return {
    tenantId: "tenant-001",
    name: "Customer Support Agent",
    description: "Enterprise customer support agent",
    instructions:
      "Answer customer questions using approved knowledge sources.",
    model: {
      provider: "openai" as const,
      model: "gpt-4.1",
      temperature: 0.2,
      maxTokens: 2048,
    },
    tools: [
      {
        name: "knowledge_search",
        description: "Search the knowledge base",
        enabled: true,
        requiresApproval: false,
      },
    ],
    metadata: {
      department: "support",
      environment: "development",
    },
  };
}

describe("Agent Management Service", () => {
  it("creates an agent in draft status", async () => {
    const service = createService();

    const agent = await service.create(validAgentInput());

    assert.ok(agent.id);
    assert.equal(agent.tenantId, "tenant-001");
    assert.equal(agent.name, "Customer Support Agent");
    assert.equal(agent.status, "draft");
    assert.equal(agent.version, 1);
    assert.equal(agent.model.provider, "openai");
  });

  it("rejects an invalid agent configuration", async () => {
    const service = createService();

    await assert.rejects(
      () =>
        service.create({
          ...validAgentInput(),
          name: "",
        }),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(error.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });

  it("rejects an unsupported model provider", async () => {
    const service = createService();

    await assert.rejects(
      () =>
        service.create({
          ...validAgentInput(),
          model: {
            provider: "unknown" as "openai",
            model: "test-model",
          },
        }),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(error.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });

  it("prevents duplicate active or draft agent names per tenant", async () => {
    const service = createService();

    await service.create(validAgentInput());

    await assert.rejects(
      () => service.create(validAgentInput()),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(
          error.code,
          "AGENT_NAME_CONFLICT",
        );
        return true;
      },
    );
  });

  it("allows the same agent name in different tenants", async () => {
    const service = createService();

    await service.create(validAgentInput());

    const second = await service.create({
      ...validAgentInput(),
      tenantId: "tenant-002",
    });

    assert.equal(second.tenantId, "tenant-002");
  });

  it("retrieves an agent by tenant and ID", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    const retrieved = await service.getById(
      "tenant-001",
      created.id,
    );

    assert.equal(retrieved.id, created.id);
  });

  it("does not expose agents across tenants", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    await assert.rejects(
      () =>
        service.getById("tenant-002", created.id),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(error.code, "AGENT_NOT_FOUND");
        return true;
      },
    );
  });

  it("updates a draft agent and increments its version", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    const updated = await service.update(
      "tenant-001",
      created.id,
      1,
      {
        name: "Updated Customer Support Agent",
        instructions: "Answer using verified documents.",
      },
    );

    assert.equal(
      updated.name,
      "Updated Customer Support Agent",
    );
    assert.equal(updated.version, 2);
    assert.equal(updated.status, "draft");
  });

  it("rejects an update with a stale version", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    await service.update(
      "tenant-001",
      created.id,
      1,
      {
        description: "First update",
      },
    );

    await assert.rejects(
      () =>
        service.update(
          "tenant-001",
          created.id,
          1,
          {
            description: "Stale update",
          },
        ),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(error.code, "VERSION_CONFLICT");
        return true;
      },
    );
  });

  it("publishes a draft agent", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    const published = await service.publish(
      "tenant-001",
      created.id,
      created.version,
    );

    assert.equal(published.status, "active");
    assert.equal(published.version, 2);
    assert.ok(published.publishedAt);
  });

  it("prevents modification of active agents", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    await service.publish(
      "tenant-001",
      created.id,
      created.version,
    );

    await assert.rejects(
      () =>
        service.update(
          "tenant-001",
          created.id,
          2,
          {
            instructions: "Changed instructions",
          },
        ),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(error.code, "AGENT_NOT_EDITABLE");
        return true;
      },
    );
  });

  it("archives an active agent", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    const published = await service.publish(
      "tenant-001",
      created.id,
      created.version,
    );

    const archived = await service.archive(
      "tenant-001",
      created.id,
      published.version,
    );

    assert.equal(archived.status, "archived");
    assert.equal(archived.version, 3);
    assert.ok(archived.archivedAt);
  });

  it("prevents deletion of active agents", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    await service.publish(
      "tenant-001",
      created.id,
      created.version,
    );

    await assert.rejects(
      () =>
        service.delete("tenant-001", created.id),
      (error: Error) => {
        assert.ok(error instanceof AgentManagementError);
        assert.equal(
          error.code,
          "ACTIVE_AGENT_DELETE_FORBIDDEN",
        );
        return true;
      },
    );
  });

  it("deletes a draft agent", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    const deleted = await service.delete(
      "tenant-001",
      created.id,
    );

    assert.equal(deleted, true);

    await assert.rejects(
      () =>
        service.getById("tenant-001", created.id),
    );
  });

  it("filters agents by provider", async () => {
    const service = createService();

    await service.create(validAgentInput());

    await service.create({
      ...validAgentInput(),
      name: "Anthropic Agent",
      model: {
        provider: "anthropic",
        model: "claude-sonnet",
      },
    });

    const results = await service.list({
      tenantId: "tenant-001",
      provider: "anthropic",
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.model.provider, "anthropic");
  });

  it("filters agents by search text", async () => {
    const service = createService();

    await service.create(validAgentInput());

    await service.create({
      ...validAgentInput(),
      name: "Finance Agent",
    });

    const results = await service.list({
      tenantId: "tenant-001",
      search: "finance",
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.name, "Finance Agent");
  });

  it("returns independent copies of stored agent data", async () => {
    const service = createService();

    const created = await service.create(validAgentInput());

    created.model.model = "modified-model";

    const stored = await service.getById(
      "tenant-001",
      created.id,
    );

    assert.equal(stored.model.model, "gpt-4.1");
  });
});