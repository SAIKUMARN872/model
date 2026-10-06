import {
  AgentDeploymentService,
  DeploymentNotFoundError,
  InvalidDeploymentError,
} from "./deployment-service.js";

const service = new AgentDeploymentService();

console.log("Running ModelNow Agent Deployment Service tests...");

const deployment = service.create({
  agentId: "agent_test_1",
  versionId: "version_test_1",
  environment: "development",
  endpoint: "https://example.test/agent",
});

console.assert(
  deployment.agentId === "agent_test_1",
  "create deployment: agentId",
);
console.assert(
  deployment.versionId === "version_test_1",
  "create deployment: versionId",
);
console.assert(
  deployment.environment === "development",
  "create deployment: environment",
);
console.assert(
  deployment.status === "pending",
  "create deployment: status",
);
console.assert(
  deployment.endpoint === "https://example.test/agent",
  "create deployment: endpoint",
);
console.log("? create deployment");

const fetched = service.getById(deployment.id);

console.assert(
  fetched.id === deployment.id,
  "get deployment",
);
console.log("? get deployment");

const listed = service.list();

console.assert(
  listed.length === 1,
  "list deployments",
);
console.log("? list deployments");

const agentDeployments =
  service.listByAgentId("agent_test_1");

console.assert(
  agentDeployments.length === 1,
  "list deployments by agent",
);
console.log("? list deployments by agent");

const started = service.start(deployment.id);

console.assert(
  started.status === "deploying",
  "start deployment",
);
console.log("? start deployment");

const deployed = service.deploy(deployment.id);

console.assert(
  deployed.status === "deployed",
  "deploy deployment status",
);
console.assert(
  deployed.deployedAt !== undefined,
  "deploy deployment timestamp",
);
console.log("? deploy deployment");

const updated = service.update(deployment.id, {
  endpoint: "https://updated.example.test/agent",
});

console.assert(
  updated.endpoint ===
    "https://updated.example.test/agent",
  "update deployment endpoint",
);
console.assert(
  updated.status === "deployed",
  "update deployment preserves status",
);
console.log("? update deployment");

const second = service.create({
  agentId: "agent_test_1",
  versionId: "version_test_2",
  environment: "production",
});

console.assert(
  service.list().length === 2,
  "create second deployment",
);
console.log("? create second deployment");

const failed = service.fail(
  second.id,
  "Deployment failed",
);

console.assert(
  failed.status === "failed",
  "fail deployment status",
);
console.assert(
  failed.error === "Deployment failed",
  "fail deployment error",
);
console.log("? fail deployment");

const rolledBack = service.rollback(
  second.id,
);

console.assert(
  rolledBack.status === "rolled_back",
  "rollback deployment status",
);
console.log("? rollback deployment");

try {
  service.create({
    agentId: "",
    environment: "development",
  });

  throw new Error(
    "Expected invalid agent id error",
  );
} catch (error) {
  console.assert(
    error instanceof InvalidDeploymentError,
    "invalid agent id validation",
  );
}
console.log("? invalid agent id validation");

try {
  service.create({
    agentId: "agent_test_1",
    environment: "",
  });

  throw new Error(
    "Expected invalid environment error",
  );
} catch (error) {
  console.assert(
    error instanceof InvalidDeploymentError,
    "invalid environment validation",
  );
}
console.log("? invalid environment validation");

try {
  service.getById("");

  throw new Error(
    "Expected invalid deployment id error",
  );
} catch (error) {
  console.assert(
    error instanceof InvalidDeploymentError,
    "invalid deployment id validation",
  );
}
console.log("? invalid deployment id validation");

try {
  service.getById("missing_deployment");

  throw new Error(
    "Expected deployment not found error",
  );
} catch (error) {
  console.assert(
    error instanceof DeploymentNotFoundError,
    "missing deployment handling",
  );
}
console.log("? missing deployment handling");

try {
  service.update("missing_deployment", {
    status: "deployed",
  });

  throw new Error(
    "Expected deployment not found error",
  );
} catch (error) {
  console.assert(
    error instanceof DeploymentNotFoundError,
    "missing deployment update handling",
  );
}
console.log("? missing deployment update handling");

try {
  service.fail(second.id, "");

  throw new Error(
    "Expected invalid deployment error",
  );
} catch (error) {
  console.assert(
    error instanceof InvalidDeploymentError,
    "invalid deployment error validation",
  );
}
console.log("? invalid deployment error validation");

service.delete(second.id);
console.log("? delete deployment");

try {
  service.getById(second.id);

  throw new Error(
    "Expected deployment to be deleted",
  );
} catch (error) {
  console.assert(
    error instanceof DeploymentNotFoundError,
    "verify deletion",
  );
}
console.log("? verify deletion");

console.log("");
console.log(
  "All ModelNow Agent Deployment Service tests passed.",
);
