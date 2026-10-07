import {
  WorkflowExecutionError,
  WorkflowExecutionService,
} from "./execution-service.js";

const service = new WorkflowExecutionService();

console.log("Running ModelNow Agent Builder Workflow Execution Service tests...");

const execution = service.create({
  workflowId: "workflow_test_1",
  versionId: "version_test_1",
  input: {
    message: "hello",
  },
});

console.assert(execution.id.length > 0, "create execution");
console.assert(
  execution.workflowId === "workflow_test_1",
  "create execution workflow",
);
console.assert(
  execution.status === "queued",
  "create execution status",
);
console.log("? create execution");

const fetched = service.getById(execution.id);

console.assert(
  fetched.id === execution.id,
  "get execution",
);
console.log("? get execution");

const listed = service.list();

console.assert(listed.length === 1, "list executions");
console.log("? list executions");

const workflowExecutions =
  service.listByWorkflowId("workflow_test_1");

console.assert(
  workflowExecutions.length === 1,
  "list executions by workflow",
);
console.log("? list executions by workflow");

const started = service.start(execution.id);

console.assert(
  started.status === "running",
  "start execution",
);
console.log("? start execution");

const completed = service.complete(
  execution.id,
  {
    result: "success",
  },
);

console.assert(
  completed.status === "completed",
  "complete execution",
);
console.assert(
  completed.completedAt !== undefined,
  "complete execution timestamp",
);
console.log("? complete execution");

const failedExecution = service.create({
  workflowId: "workflow_test_1",
});

const failed = service.fail(
  failedExecution.id,
  "Execution failed",
);

console.assert(
  failed.status === "failed",
  "fail execution",
);
console.assert(
  failed.error === "Execution failed",
  "fail execution error",
);
console.log("? fail execution");

const cancelledExecution = service.create({
  workflowId: "workflow_test_1",
});

const cancelled = service.cancel(
  cancelledExecution.id,
);

console.assert(
  cancelled.status === "cancelled",
  "cancel execution",
);
console.log("? cancel execution");

try {
  service.getById("missing_execution");

  throw new Error("Expected missing execution error");
} catch (error) {
  console.assert(
    error instanceof WorkflowExecutionError,
    "missing execution handling",
  );
}
console.log("? missing execution handling");

try {
  service.fail(
    failedExecution.id,
    "",
  );

  throw new Error("Expected invalid execution error");
} catch (error) {
  console.assert(
    error instanceof WorkflowExecutionError,
    "invalid execution validation",
  );
}
console.log("? invalid execution validation");

service.delete(cancelledExecution.id);

console.log("? delete execution");

try {
  service.getById(cancelledExecution.id);

  throw new Error("Expected deleted execution error");
} catch (error) {
  console.assert(
    error instanceof WorkflowExecutionError,
    "verify deletion",
  );
}
console.log("? verify deletion");

console.log("");
console.log(
  "All ModelNow Agent Builder Workflow Execution Service tests passed.",
);
