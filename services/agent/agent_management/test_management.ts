import assert from "node:assert/strict";

import {
  AgentManagementError,
  AgentManagementService,
} from "./management-service.js";

const service = new AgentManagementService();

console.log("Running ModelNow Agent Management Service tests...");

const agent = await service.create({
  tenantId: "tenant_test_1",
  name: "Test Agent",
  description: "Test agent description",
  instructions: "You are a helpful test agent.",
  model: {
    provider: "openai",
    model: "gpt-test",
  },
  tools: [
    { name: "search", enabled: true },
    { name: "calculator", enabled: true },
  ],
  metadata: {
    environment: "test",
  },
});

assert(agent.id.length > 0, "create agent: id");
assert.equal(agent.tenantId, "tenant_test_1", "create agent: tenantId");
assert.equal(agent.name, "Test Agent", "create agent: name");
assert.equal(agent.status, "draft", "create agent: status");
assert.equal(agent.version, 1, "create agent: version");
console.log("? create agent");

const fetched = await service.getById(
  "tenant_test_1",
  agent.id,
);

assert.equal(fetched.id, agent.id, "get agent");
assert.equal(fetched.name, "Test Agent", "get agent name");
console.log("? get agent");

const listed = await service.list({
  tenantId: "tenant_test_1",
});

assert.equal(listed.length, 1, "list agents");
assert.equal(listed[0]?.id, agent.id, "list agent id");
console.log("? list agents");

const updated = await service.update(
  "tenant_test_1",
  agent.id,
  agent.version,
  {
    description: "Updated test agent",
  },
);

assert.equal(
  updated.description,
  "Updated test agent",
  "update agent description",
);
assert.equal(
  updated.version,
  2,
  "update agent version",
);
console.log("? update agent");

const published = await service.publish(
  "tenant_test_1",
  agent.id,
  updated.version,
);

assert.equal(
  published.status,
  "active",
  "publish agent status",
);
assert.equal(
  published.version,
  3,
  "publish agent version",
);
assert.ok(
  published.publishedAt,
  "publish agent timestamp",
);
console.log("? publish agent");

try {
  await service.update(
    "tenant_test_1",
    agent.id,
    published.version,
    {
      description: "Should not update active agent",
    },
  );

  throw new Error("Expected active agent update error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "active agent update protection",
  );
  assert(
    (error as AgentManagementError).code ===
      "AGENT_NOT_EDITABLE",
    "active agent update error code",
  );
}
console.log("? active agent update protection");

try {
  await service.create({
    tenantId: "tenant_test_1",
    name: "Test Agent",
    instructions: "Duplicate agent",
    model: {
      provider: "openai",
      model: "gpt-test",
    },
  });

  throw new Error("Expected duplicate name error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "duplicate agent name protection",
  );
  assert(
    (error as AgentManagementError).code ===
      "AGENT_NAME_CONFLICT",
    "duplicate agent name error code",
  );
}
console.log("? duplicate agent name protection");

try {
  await service.getById(
    "tenant_test_1",
    "missing_agent",
  );

  throw new Error("Expected missing agent error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "missing agent handling",
  );
  assert(
    (error as AgentManagementError).code ===
      "AGENT_NOT_FOUND",
    "missing agent error code",
  );
}
console.log("? missing agent handling");

try {
  await service.create({
    tenantId: "",
    name: "Invalid Agent",
    instructions: "Invalid",
    model: {
      provider: "openai",
      model: "gpt-test",
    },
  });

  throw new Error("Expected validation error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "invalid tenant validation",
  );
  assert(
    (error as AgentManagementError).code ===
      "VALIDATION_ERROR",
    "invalid tenant error code",
  );
}
console.log("? invalid tenant validation");

try {
  await service.list({
    tenantId: "tenant_test_1",
    limit: 0,
  });

  throw new Error("Expected invalid limit error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "invalid limit validation",
  );
  assert(
    (error as AgentManagementError).code ===
      "VALIDATION_ERROR",
    "invalid limit error code",
  );
}
console.log("? invalid limit validation");

const versionConflictAgent = await service.create({
  tenantId: "tenant_test_1",
  name: "Version Conflict Test Agent",
  instructions: "Version conflict test",
  model: {
    provider: "openai",
    model: "gpt-test",
  },
});

try {
  await service.update(
    "tenant_test_1",
    versionConflictAgent.id,
    999,
    {
      description: "Wrong version",
    },
  );

  throw new Error("Expected version conflict error");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "version conflict handling",
  );
  assert(
    (error as AgentManagementError).code ===
      "VERSION_CONFLICT",
    "version conflict error code",
  );
}
console.log("? version conflict handling");

const archiveAgent = await service.create({
  tenantId: "tenant_test_1",
  name: "Archive Test Agent",
  instructions: "Archive test",
  model: {
    provider: "openai",
    model: "gpt-test",
  },
});

const archived = await service.archive(
  "tenant_test_1",
  archiveAgent.id,
  archiveAgent.version,
);

assert.equal(
  archived.status,
  "archived",
  "archive agent status",
);
assert.ok(
  archived.archivedAt,
  "archive agent timestamp",
);
console.log("? archive agent");

const deleted = await service.delete(
  "tenant_test_1",
  archiveAgent.id,
);

assert.equal(deleted, true, "delete agent");
console.log("? delete agent");

try {
  await service.getById(
    "tenant_test_1",
    archiveAgent.id,
  );

  throw new Error("Expected deleted agent to be missing");
} catch (error) {
  assert(
    error instanceof AgentManagementError,
    "verify deletion",
  );
  assert(
    (error as AgentManagementError).code ===
      "AGENT_NOT_FOUND",
    "verify deletion error code",
  );
}
console.log("? verify deletion");

console.log("");
console.log("All ModelNow Agent Management Service tests passed.");
