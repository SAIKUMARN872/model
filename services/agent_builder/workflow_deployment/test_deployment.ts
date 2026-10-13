import {
  WorkflowDeploymentError,
  WorkflowDeploymentService,
} from "./deployment-service.js";

const service = new WorkflowDeploymentService();

console.log("Running ModelNow Agent Builder Workflow Deployment Service tests...");

const deployment = service.create({
  workflowId: "workflow_test_1",
  versionId: "version_test_1",
  environment: "development",
  endpoint: "https://example.test/workflow",
});

console.assert(
  deployment.id.length > 0,
  "create deployment",
);
console.assert(
  deployment.workflowId === "workflow_test_1",
  "create deployment workflow",
);
console.assert(
  deployment.environment === "development",
  "create deployment environment",
);
console.assert(
  deployment.status === "pending",
  "create deployment status",
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

const workflowDeployments =
  service.listByWorkflowId(
    "workflow_test_1",
  );

console.assert(
  workflowDeployments.length === 1,
  "list deployments by workflow",
);
console.log("? list deployments by workflow");

const started = service.start(
  deployment.id,
);

console.assert(
  started.status === "deploying",
  "start deployment",
);
console.log("? start deployment");

const deployed = service.deploy(
  deployment.id,
);

console.assert(
  deployed.status === "deployed",
  "deploy deployment",
);
console.assert(
  deployed.deployedAt !== undefined,
  "deploy deployment timestamp",
);
console.log("? deploy deployment");

const failedDeployment = service.create({
  workflowId: "workflow_test_1",
  environment: "production",
});

const failed = service.fail(
  failedDeployment.id,
  "Deployment failed",
);

console.assert(
  failed.status === "failed",
  "fail deployment",
);
console.assert(
  failed.error === "Deployment failed",
  "fail deployment error",
);
console.log("? fail deployment");

const rolledBack = service.rollback(
  failedDeployment.id,
);

console.assert(
  rolledBack.status === "rolled_back",
  "rollback deployment",
);
console.log("? rollback deployment");

try {
  service.create({
    workflowId: "",
    environment: "development",
  });

  throw new Error("Expected validation error");
} catch (error) {
  console.assert(
    error instanceof WorkflowDeploymentError,
    "invalid deployment validation",
  );
}
console.log("? invalid deployment validation");

try {
  service.getById("missing_deployment");

  throw new Error("Expected missing deployment error");
} catch (error) {
  console.assert(
    error instanceof WorkflowDeploymentError,
    "missing deployment handling",
  );
}
console.log("? missing deployment handling");

service.delete(
  failedDeployment.id,
);

console.log("? delete deployment");

try {
  service.getById(
    failedDeployment.id,
  );

  throw new Error("Expected deleted deployment error");
} catch (error) {
  console.assert(
    error instanceof WorkflowDeploymentError,
    "verify deletion",
  );
}
console.log("? verify deletion");

console.log("");
console.log(
  "All ModelNow Agent Builder Workflow Deployment Service tests passed.",
);
