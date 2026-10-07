import {
  WorkflowManagementError,
  WorkflowManagementService,
} from "./management-service.js";

const service = new WorkflowManagementService();

console.log("Running ModelNow Agent Builder Workflow Management Service tests...");

const workflow = await service.create({
  tenantId: "tenant_test_1",
  name: "Test Workflow",
  description: "Test workflow",
  nodes: ["node_1"],
});

console.assert(workflow.id.length > 0, "create workflow");
console.assert(workflow.name === "Test Workflow", "create workflow name");
console.assert(workflow.status === "draft", "create workflow status");
console.assert(workflow.version === 1, "create workflow version");
console.log("? create workflow");

const fetched = await service.getById(
  "tenant_test_1",
  workflow.id,
);

console.assert(fetched.id === workflow.id, "get workflow");
console.log("? get workflow");

const listed = await service.list({
  tenantId: "tenant_test_1",
});

console.assert(listed.length === 1, "list workflows");
console.log("? list workflows");

const updated = await service.update(
  "tenant_test_1",
  workflow.id,
  workflow.version,
  {
    description: "Updated workflow",
  },
);

console.assert(
  updated.description === "Updated workflow",
  "update workflow",
);
console.assert(updated.version === 2, "update workflow version");
console.log("? update workflow");

const published = await service.publish(
  "tenant_test_1",
  workflow.id,
  updated.version,
);

console.assert(
  published.status === "active",
  "publish workflow",
);
console.assert(
  published.publishedAt !== undefined,
  "publish workflow timestamp",
);
console.log("? publish workflow");

try {
  await service.create({
    tenantId: "tenant_test_1",
    name: "Test Workflow",
  });

  throw new Error("Expected duplicate workflow error");
} catch (error) {
  console.assert(
    error instanceof WorkflowManagementError,
    "duplicate workflow protection",
  );
}
console.log("? duplicate workflow protection");

try {
  await service.getById(
    "tenant_test_1",
    "missing_workflow",
  );

  throw new Error("Expected missing workflow error");
} catch (error) {
  console.assert(
    error instanceof WorkflowManagementError,
    "missing workflow handling",
  );
}
console.log("? missing workflow handling");

try {
  await service.update(
    "tenant_test_1",
    workflow.id,
    published.version,
    {
      description: "Cannot update active workflow",
    },
  );

  throw new Error("Expected active workflow update error");
} catch (error) {
  console.assert(
    error instanceof WorkflowManagementError,
    "active workflow protection",
  );
}
console.log("? active workflow protection");

const archiveWorkflow = await service.create({
  tenantId: "tenant_test_1",
  name: "Archive Workflow",
});

const archived = await service.archive(
  "tenant_test_1",
  archiveWorkflow.id,
  archiveWorkflow.version,
);

console.assert(
  archived.status === "archived",
  "archive workflow",
);
console.log("? archive workflow");

await service.delete(
  "tenant_test_1",
  archiveWorkflow.id,
);

console.log("? delete workflow");

try {
  await service.getById(
    "tenant_test_1",
    archiveWorkflow.id,
  );

  throw new Error("Expected deleted workflow error");
} catch (error) {
  console.assert(
    error instanceof WorkflowManagementError,
    "verify workflow deletion",
  );
}
console.log("? verify deletion");

console.log("");
console.log(
  "All ModelNow Agent Builder Workflow Management Service tests passed.",
);
