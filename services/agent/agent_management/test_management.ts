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
  tools: ["search", "calculator"],
  metadata: {
    environment: "test",
  },
});

console.assert(agent.id.length > 0, "create agent: id");
console.assert(agent.tenantId === "tenant_test_1", "create agent: tenantId");
console.assert(agent.name === "Test Agent", "create agent: name");
console.assert(agent.status === "draft", "create agent: status");
console.assert(agent.version === 1, "create agent: version");
console.log("? create agent");

const fetched = await service.getById(
  "tenant_test_1",
  agent.id,
);

console.assert(fetched.id === agent.id, "get agent");
console.assert(fetched.name === "Test Agent", "get agent name");
console.log("? get agent");

const listed = await service.list({
  tenantId: "tenant_test_1",
});

console.assert(listed.length === 1, "list agents");
console.assert(listed[0].id === agent.id, "list agent id");
console.log("? list agents");

const updated = await service.update(
  "tenant_test_1",
  agent.id,
  agent.version,
  {
    description: "Updated test agent",
  },
);

console.assert(
  updated.description === "Updated test agent",
  "update agent description",
);
console.assert(
  updated.version === 2,
  "update agent version",
);
console.log("? update agent");

const published = await service.publish(
  "tenant_test_1",
  agent.id,
  updated.version,
);

console.assert(
  published.status === "active",
  "publish agent status",
);
console.assert(
  published.version === 3,
  "publish agent version",
);
console.assert(
  published.publishedAt !== undefined,
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
  console.assert(
    error instanceof AgentManagementError,
    "active agent update protection",
  );
  console.assert(
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
  console.assert(
    error instanceof AgentManagementError,
    "duplicate agent name protection",
  );
  console.assert(
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
  console.assert(
    error instanceof AgentManagementError,
    "missing agent handling",
  );
  console.assert(
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
  console.assert(
    error instanceof AgentManagementError,
    "invalid tenant validation",
  );
  console.assert(
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
  console.assert(
    error instanceof AgentManagementError,
    "invalid limit validation",
  );
  console.assert(
    (error as AgentManagementError).code ===
      "VALIDATION_ERROR",
    "invalid limit error code",
  );
}
console.log("? invalid limit validation");

try {
  await service.update(
    "tenant_test_1",
    agent.id,
    999,
    {
      description: "Wrong version",
    },
  );

  throw new Error("Expected version conflict error");
} catch (error) {
  console.assert(
    error instanceof AgentManagementError,
    "version conflict handling",
  );
  console.assert(
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

console.assert(
  archived.status === "archived",
  "archive agent status",
);
console.assert(
  archived.archivedAt !== undefined,
  "archive agent timestamp",
);
console.log("? archive agent");

const deleted = await service.delete(
  "tenant_test_1",
  archiveAgent.id,
);

console.assert(deleted === true, "delete agent");
console.log("? delete agent");

try {
  await service.getById(
    "tenant_test_1",
    archiveAgent.id,
  );

  throw new Error("Expected deleted agent to be missing");
} catch (error) {
  console.assert(
    error instanceof AgentManagementError,
    "verify deletion",
  );
  console.assert(
    (error as AgentManagementError).code ===
      "AGENT_NOT_FOUND",
    "verify deletion error code",
  );
}
console.log("? verify deletion");

console.log("");
console.log("All ModelNow Agent Management Service tests passed.");
