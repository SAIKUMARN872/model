import assert from "node:assert/strict";

import {
  EnterpriseAgentService,
} from "../enterprise/enterprise-agent-service.js";

import {
  InMemoryEnterpriseAgentRepository,
} from "../enterprise/enterprise-agent-repository.js";

import {
  EnterpriseAgentController,
} from "../enterprise/enterprise-agent-controller.js";

import {
  AgentService,
} from "../api/agent-service.js";

import {
  AgentController,
} from "../api/agent-controller.js";

import {
  WorkflowService,
} from "../workflows/workflow-service.js";

import {
  WorkflowController,
} from "../workflows/workflow-controller.js";

import {
  InMemoryWorkflowRepository,
} from "../repository/workflow-repository.js";

import {
  AgentJobService,
} from "../jobs/agent-job.js";

import {
  JobManager,
} from "../jobs/job-manager.js";

import {
  AgentEventBus,
} from "../events/agent-events.js";

import {
  WorkflowEventBus,
} from "../events/workflow-events.js";

import {
  DefaultAgentWorker,
} from "../workers/agent-worker.js";

import {
  DefaultEnterpriseAgentWorker,
} from "../workers/enterprise-agent-worker.js";

import {
  DefaultWorkflowWorker,
} from "../workers/workflow-worker.js";

import {
  ApprovalWorker,
} from "../workers/approval-worker.js";

import {
  settings,
} from "../config/settings.js";

import {
  getConfig,
} from "../config/config.js";

import {
  ConflictError,
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "../exceptions.js";

import {
  generateId,
  now,
  clone,
  requiredString,
  optionalString,
} from "../utils.js";

import {
  validateRequiredString,
  success,
  failure,
} from "../schemas.js";


// ============================================================
// TEST HELPERS
// ============================================================

let passed = 0;

function check(
  name: string,
  condition: boolean,
): void {
  assert.equal(
    condition,
    true,
    `Test failed: ${name}`,
  );

  passed += 1;
  console.log(`✓ ${name}`);
}

async function expectError(
  name: string,
  operation: () => unknown | Promise<unknown>,
  errorType: new (...args: never[]) => Error,
): Promise<void> {
  await assert.rejects(
    async () => {
      await operation();
    },
    errorType,
  );

  passed += 1;
  console.log(`✓ ${name}`);
}


// ============================================================
// START
// ============================================================

console.log("");
console.log(
  "Running ModelNow Complete Agents Mock Test Suite...",
);
console.log("");


// ============================================================
// 1. CONFIGURATION
// ============================================================

check(
  "configuration has default model",
  typeof settings.defaultModel === "string" &&
    settings.defaultModel.length > 0,
);

check(
  "configuration has concurrency limit",
  settings.maxConcurrentJobs > 0,
);

check(
  "configuration has timeout",
  settings.jobTimeoutMs > 0,
);

const configuration = getConfig();

check(
  "configuration loads environment",
  typeof configuration.environment === "string",
);

check(
  "configuration exposes settings",
  configuration.settings === settings,
);


// ============================================================
// 2. UTILITY FUNCTIONS
// ============================================================

const generatedId = generateId("test");

check(
  "generateId creates prefixed id",
  generatedId.startsWith("test_"),
);

const timestamp = now();

check(
  "now returns ISO timestamp",
  !Number.isNaN(Date.parse(timestamp)),
);

const originalObject = {
  nested: {
    value: 10,
  },
};

const clonedObject = clone(originalObject);

clonedObject.nested.value = 20;

check(
  "clone creates independent object",
  originalObject.nested.value === 10,
);

check(
  "requiredString accepts valid value",
  requiredString(" hello ", "name") === "hello",
);

check(
  "optionalString accepts undefined",
  optionalString(undefined, "description") === undefined,
);

check(
  "optionalString trims valid value",
  optionalString(" hello ", "description") === "hello",
);


// ============================================================
// 3. SCHEMA HELPERS
// ============================================================

const validSchema = validateRequiredString(
  "value",
  "field",
);

check(
  "schema accepts required string",
  validSchema === undefined,
);

const invalidSchema = validateRequiredString(
  "",
  "field",
);

check(
  "schema rejects empty required string",
  invalidSchema !== undefined,
);

const successfulResult = success({
  value: 1,
});

check(
  "schema success result is valid",
  successfulResult.valid === true &&
    successfulResult.data?.value === 1,
);

const failedResult = failure(
  "validation failed",
);

check(
  "schema failure result is invalid",
  failedResult.valid === false &&
    failedResult.errors.length === 1,
);


// ============================================================
// 4. ENTERPRISE AGENT REPOSITORY
// ============================================================

const enterpriseRepository =
  new InMemoryEnterpriseAgentRepository();

const enterpriseService =
  new EnterpriseAgentService(
    enterpriseRepository,
  );

const tenantA = "tenant_a";
const tenantB = "tenant_b";


// ============================================================
// 5. ENTERPRISE AGENT CREATE
// ============================================================

const enterpriseAgent =
  await enterpriseService.create({
    tenantId: tenantA,
    name: "Mock Enterprise Agent",
    description: "Complete mock test agent",
    instructions: "You are a mock test agent.",
    model: "mock-model",
    tools: [
      {
        name: "search",
        description: "Mock search",
        config: {
          enabled: true,
        },
      },
    ],
    metadata: {
      test: true,
    },
  });

check(
  "enterprise agent create",
  enterpriseAgent.id.length > 0 &&
    enterpriseAgent.tenantId === tenantA &&
    enterpriseAgent.name === "Mock Enterprise Agent",
);

check(
  "enterprise agent starts in draft",
  enterpriseAgent.status === "draft",
);

check(
  "enterprise agent stores model",
  enterpriseAgent.model === "mock-model",
);

check(
  "enterprise agent stores tools",
  enterpriseAgent.tools.length === 1 &&
    enterpriseAgent.tools[0].name === "search",
);

check(
  "enterprise agent stores metadata",
  enterpriseAgent.metadata.test === true,
);


// ============================================================
// 6. ENTERPRISE AGENT GET
// ============================================================

const fetchedEnterpriseAgent =
  await enterpriseService.getById(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "enterprise agent get",
  fetchedEnterpriseAgent.id ===
    enterpriseAgent.id,
);


// ============================================================
// 7. TENANT ISOLATION
// ============================================================

await expectError(
  "enterprise agent tenant isolation",
  () =>
    enterpriseService.getById(
      tenantB,
      enterpriseAgent.id,
    ),
  NotFoundError,
);


// ============================================================
// 8. ENTERPRISE AGENT LIST
// ============================================================

const enterpriseAgents =
  await enterpriseService.list(tenantA);

check(
  "enterprise agent list",
  enterpriseAgents.length === 1 &&
    enterpriseAgents[0].id === enterpriseAgent.id,
);


// ============================================================
// 9. ENTERPRISE AGENT UPDATE
// ============================================================

const updatedEnterpriseAgent =
  await enterpriseService.update(
    tenantA,
    enterpriseAgent.id,
    {
      name: "Updated Enterprise Agent",
      description: "Updated description",
      instructions: "Updated instructions.",
    },
  );

check(
  "enterprise agent update",
  updatedEnterpriseAgent.name ===
    "Updated Enterprise Agent" &&
    updatedEnterpriseAgent.description ===
      "Updated description",
);

check(
  "enterprise agent instructions update",
  updatedEnterpriseAgent.instructions ===
    "Updated instructions.",
);


// ============================================================
// 10. ENTERPRISE AGENT DUPLICATE PROTECTION
// ============================================================

await enterpriseService.create({
  tenantId: tenantA,
  name: "Second Agent",
  instructions: "Second agent.",
});

await expectError(
  "enterprise agent duplicate protection",
  () =>
    enterpriseService.create({
      tenantId: tenantA,
      name: "Second Agent",
      instructions: "Duplicate.",
    }),
  ConflictError,
);


// ============================================================
// 11. ENTERPRISE AGENT ACTIVATION
// ============================================================

const activatedAgent =
  await enterpriseService.activate(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "enterprise agent activation",
  activatedAgent.status === "active",
);


// ============================================================
// 12. ACTIVE AGENT UPDATE PROTECTION
// ============================================================

await expectError(
  "active enterprise agent update protection",
  () =>
    enterpriseService.update(
      tenantA,
      enterpriseAgent.id,
      {
        name: "Cannot Update",
      },
    ),
  InvalidStateError,
);


// ============================================================
// 13. ACTIVE AGENT PAUSE
// ============================================================

const pausedAgent =
  await enterpriseService.pause(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "enterprise agent pause",
  pausedAgent.status === "paused",
);


// ============================================================
// 14. PAUSED AGENT REACTIVATION
// ============================================================

const reactivatedAgent =
  await enterpriseService.activate(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "paused enterprise agent reactivation",
  reactivatedAgent.status === "active",
);


// ============================================================
// 15. ACTIVE DELETE PROTECTION
// ============================================================

await expectError(
  "active enterprise agent delete protection",
  () =>
    enterpriseService.delete(
      tenantA,
      enterpriseAgent.id,
    ),
  InvalidStateError,
);


// ============================================================
// 16. ENTERPRISE AGENT ARCHIVE
// ============================================================

const archivedAgent =
  await enterpriseService.archive(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "enterprise agent archive",
  archivedAgent.status === "archived",
);


// ============================================================
// 17. ARCHIVED AGENT UPDATE PROTECTION
// ============================================================

await expectError(
  "archived enterprise agent update protection",
  () =>
    enterpriseService.update(
      tenantA,
      enterpriseAgent.id,
      {
        name: "Cannot Update Archived",
      },
    ),
  InvalidStateError,
);


// ============================================================
// 18. ENTERPRISE AGENT DELETE
// ============================================================

const enterpriseDeleted =
  await enterpriseService.delete(
    tenantA,
    enterpriseAgent.id,
  );

check(
  "enterprise agent delete",
  enterpriseDeleted === true,
);

await expectError(
  "verify enterprise agent deletion",
  () =>
    enterpriseService.getById(
      tenantA,
      enterpriseAgent.id,
    ),
  NotFoundError,
);


// ============================================================
// 19. ENTERPRISE VALIDATION
// ============================================================

await expectError(
  "enterprise agent invalid tenant",
  () =>
    enterpriseService.create({
      tenantId: "",
      name: "Invalid",
      instructions: "Invalid",
    }),
  ValidationError,
);

await expectError(
  "enterprise agent invalid name",
  () =>
    enterpriseService.create({
      tenantId: tenantA,
      name: "",
      instructions: "Invalid",
    }),
  ValidationError,
);

await expectError(
  "enterprise agent invalid instructions",
  () =>
    enterpriseService.create({
      tenantId: tenantA,
      name: "Invalid",
      instructions: "",
    }),
  ValidationError,
);

await expectError(
  "enterprise agent missing id",
  () =>
    enterpriseService.getById(
      tenantA,
      "",
    ),
  ValidationError,
);


// ============================================================
// 20. PUBLIC AGENT SERVICE
// ============================================================

const publicAgentService =
  new AgentService();

const publicAgent =
  await publicAgentService.create({
    tenantId: "tenant_public",
    name: "Public API Agent",
    instructions: "Public API test agent.",
  });

check(
  "public agent service create",
  publicAgent.name === "Public API Agent",
);

const publicFetched =
  await publicAgentService.getById(
    "tenant_public",
    publicAgent.id,
  );

check(
  "public agent service get",
  publicFetched.id === publicAgent.id,
);

const publicList =
  await publicAgentService.list(
    "tenant_public",
  );

check(
  "public agent service list",
  publicList.length === 1,
);


// ============================================================
// 21. AGENT CONTROLLER
// ============================================================

const agentController =
  new AgentController();

const controllerAgent =
  await agentController.create({
    tenantId: "tenant_controller",
    name: "Controller Agent",
    instructions: "Controller test.",
  });

check(
  "agent controller create",
  controllerAgent.name === "Controller Agent",
);

const controllerFetched =
  await agentController.get(
    "tenant_controller",
    controllerAgent.id,
  );

check(
  "agent controller get",
  controllerFetched.id ===
    controllerAgent.id,
);

const controllerUpdated =
  await agentController.update(
    "tenant_controller",
    controllerAgent.id,
    {
      description: "Controller updated",
    },
  );

check(
  "agent controller update",
  controllerUpdated.description ===
    "Controller updated",
);

const controllerActivated =
  await agentController.activate(
    "tenant_controller",
    controllerAgent.id,
  );

check(
  "agent controller activate",
  controllerActivated.status === "active",
);

const controllerPaused =
  await agentController.pause(
    "tenant_controller",
    controllerAgent.id,
  );

check(
  "agent controller pause",
  controllerPaused.status === "paused",
);

const controllerArchived =
  await agentController.archive(
    "tenant_controller",
    controllerAgent.id,
  );

check(
  "agent controller archive",
  controllerArchived.status === "archived",
);

const controllerDeleted =
  await agentController.delete(
    "tenant_controller",
    controllerAgent.id,
  );

check(
  "agent controller delete",
  controllerDeleted === true,
);


// ============================================================
// 22. WORKFLOW REPOSITORY
// ============================================================

const workflowRepository =
  new InMemoryWorkflowRepository();

const workflowService =
  new WorkflowService(
    workflowRepository,
  );

const workflow =
  await workflowService.create({
    tenantId: tenantA,
    name: "Mock Workflow",
    description: "Mock workflow.",
    steps: [
      {
        id: "step_1",
        name: "Input",
        type: "input",
        config: {},
      },
      {
        id: "step_2",
        name: "LLM",
        type: "llm",
        config: {
          model: "mock-model",
        },
      },
    ],
    metadata: {
      mock: true,
    },
  });

check(
  "workflow create",
  workflow.id.length > 0 &&
    workflow.name === "Mock Workflow" &&
    workflow.status === "draft",
);

check(
  "workflow stores steps",
  workflow.steps.length === 2,
);


// ============================================================
// 23. WORKFLOW GET
// ============================================================

const fetchedWorkflow =
  await workflowService.getById(
    tenantA,
    workflow.id,
  );

check(
  "workflow get",
  fetchedWorkflow.id === workflow.id,
);


// ============================================================
// 24. WORKFLOW LIST
// ============================================================

const workflows =
  await workflowService.list(tenantA);

check(
  "workflow list",
  workflows.length === 1,
);


// ============================================================
// 25. WORKFLOW UPDATE
// ============================================================

const updatedWorkflow =
  await workflowService.update(
    tenantA,
    workflow.id,
    {
      description: "Updated mock workflow",
    },
  );

check(
  "workflow update",
  updatedWorkflow.description ===
    "Updated mock workflow",
);


// ============================================================
// 26. WORKFLOW DUPLICATE PROTECTION
// ============================================================

await expectError(
  "workflow duplicate protection",
  () =>
    workflowService.create({
      tenantId: tenantA,
      name: "Mock Workflow",
    }),
  ConflictError,
);


// ============================================================
// 27. WORKFLOW ACTIVATION
// ============================================================

const activeWorkflow =
  await workflowService.activate(
    tenantA,
    workflow.id,
  );

check(
  "workflow activation",
  activeWorkflow.status === "active",
);


// ============================================================
// 28. ACTIVE WORKFLOW UPDATE PROTECTION
// ============================================================

await expectError(
  "active workflow update protection",
  () =>
    workflowService.update(
      tenantA,
      workflow.id,
      {
        name: "Cannot Update Workflow",
      },
    ),
  InvalidStateError,
);


// ============================================================
// 29. WORKFLOW PAUSE
// ============================================================

const pausedWorkflow =
  await workflowService.pause(
    tenantA,
    workflow.id,
  );

check(
  "workflow pause",
  pausedWorkflow.status === "paused",
);


// ============================================================
// 30. WORKFLOW REACTIVATION
// ============================================================

const reactivatedWorkflow =
  await workflowService.activate(
    tenantA,
    workflow.id,
  );

check(
  "workflow reactivation",
  reactivatedWorkflow.status === "active",
);


// ============================================================
// 31. WORKFLOW ARCHIVE
// ============================================================

const archivedWorkflow =
  await workflowService.archive(
    tenantA,
    workflow.id,
  );

check(
  "workflow archive",
  archivedWorkflow.status === "archived",
);


// ============================================================
// 32. WORKFLOW DELETE
// ============================================================

const workflowDeleted =
  await workflowService.delete(
    tenantA,
    workflow.id,
  );

check(
  "workflow delete",
  workflowDeleted === true,
);

await expectError(
  "verify workflow deletion",
  () =>
    workflowService.getById(
      tenantA,
      workflow.id,
    ),
  NotFoundError,
);


// ============================================================
// 33. WORKFLOW VALIDATION
// ============================================================

await expectError(
  "workflow invalid tenant",
  () =>
    workflowService.create({
      tenantId: "",
      name: "Invalid Workflow",
    }),
  ValidationError,
);

await expectError(
  "workflow invalid name",
  () =>
    workflowService.create({
      tenantId: tenantA,
      name: "",
    }),
  ValidationError,
);

await expectError(
  "workflow missing id",
  () =>
    workflowService.getById(
      tenantA,
      "",
    ),
  ValidationError,
);


// ============================================================
// 34. WORKFLOW CONTROLLER
// ============================================================

const workflowController =
  new WorkflowController();

const controllerWorkflow =
  await workflowController.create({
    tenantId: "tenant_workflow_controller",
    name: "Controller Workflow",
  });

check(
  "workflow controller create",
  controllerWorkflow.name ===
    "Controller Workflow",
);

const controllerWorkflowFetched =
  await workflowController.get(
    "tenant_workflow_controller",
    controllerWorkflow.id,
  );

check(
  "workflow controller get",
  controllerWorkflowFetched.id ===
    controllerWorkflow.id,
);

const controllerWorkflowUpdated =
  await workflowController.update(
    "tenant_workflow_controller",
    controllerWorkflow.id,
    {
      description: "Controller workflow update",
    },
  );

check(
  "workflow controller update",
  controllerWorkflowUpdated.description ===
    "Controller workflow update",
);

const controllerWorkflowActive =
  await workflowController.activate(
    "tenant_workflow_controller",
    controllerWorkflow.id,
  );

check(
  "workflow controller activate",
  controllerWorkflowActive.status ===
    "active",
);

const controllerWorkflowPaused =
  await workflowController.pause(
    "tenant_workflow_controller",
    controllerWorkflow.id,
  );

check(
  "workflow controller pause",
  controllerWorkflowPaused.status ===
    "paused",
);

const controllerWorkflowArchived =
  await workflowController.archive(
    "tenant_workflow_controller",
    controllerWorkflow.id,
  );

check(
  "workflow controller archive",
  controllerWorkflowArchived.status ===
    "archived",
);

const controllerWorkflowDeleted =
  await workflowController.delete(
    "tenant_workflow_controller",
    controllerWorkflow.id,
  );

check(
  "workflow controller delete",
  controllerWorkflowDeleted === true,
);


// ============================================================
// 35. JOB SERVICE
// ============================================================

const jobService =
  new AgentJobService();

const job =
  jobService.create({
    tenantId: tenantA,
    agentId: "agent_mock",
    name: "Mock Agent Job",
    input: {
      message: "hello",
      value: 42,
    },
    priority: 10,
  });

check(
  "job create",
  job.id.startsWith("job_") &&
    job.status === "queued",
);

check(
  "job stores tenant",
  job.tenantId === tenantA,
);

check(
  "job stores agent",
  job.agentId === "agent_mock",
);

check(
  "job stores name",
  job.name === "Mock Agent Job",
);

check(
  "job stores priority",
  job.priority === 10,
);

check(
  "job stores input",
  typeof job.input === "object",
);


// ============================================================
// 36. JOB DEFAULTS
// ============================================================

const defaultJob =
  jobService.create({
    tenantId: tenantA,
    agentId: "agent_mock",
    name: "Default Job",
  });

check(
  "job default status",
  defaultJob.status === "queued",
);

check(
  "job default priority",
  defaultJob.priority === 0,
);


// ============================================================
// 37. JOB MANAGER
// ============================================================

const jobManager =
  new JobManager();

const managedJob =
  jobManager.create({
    tenantId: tenantA,
    agentId: "agent_mock",
    name: "Managed Job",
  });

check(
  "job manager create",
  managedJob.name === "Managed Job",
);


// ============================================================
// 38. JOB VALIDATION
// ============================================================

assert.throws(
  () =>
    jobService.create({
      tenantId: "",
      agentId: "agent_mock",
      name: "Invalid",
    }),
);

passed += 1;
console.log("✓ job invalid tenant validation");

assert.throws(
  () =>
    jobService.create({
      tenantId: tenantA,
      agentId: "",
      name: "Invalid",
    }),
);

passed += 1;
console.log("✓ job invalid agent validation");

assert.throws(
  () =>
    jobService.create({
      tenantId: tenantA,
      agentId: "agent_mock",
      name: "",
    }),
);

passed += 1;
console.log("✓ job invalid name validation");


// ============================================================
// 39. AGENT EVENT BUS
// ============================================================

const agentEventBus =
  new AgentEventBus();

let receivedAgentEvent = false;

const unsubscribeAgent =
  agentEventBus.subscribe(
    "agent.created",
    async (event) => {
      receivedAgentEvent =
        event.type === "agent.created" &&
        event.agent.id === "event_agent";
    },
  );

await agentEventBus.publish({
  id: "event_1",
  type: "agent.created",
  timestamp: new Date().toISOString(),
  agent: {
    id: "event_agent",
    tenantId: tenantA,
    name: "Event Agent",
    instructions: "Event test",
    model: "mock",
    tools: [],
    metadata: {},
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

check(
  "agent event publish",
  receivedAgentEvent === true,
);

unsubscribeAgent();


// ============================================================
// 40. EVENT UNSUBSCRIBE
// ============================================================

receivedAgentEvent = false;

await agentEventBus.publish({
  id: "event_2",
  type: "agent.created",
  timestamp: new Date().toISOString(),
  agent: {
    id: "event_agent_2",
    tenantId: tenantA,
    name: "Event Agent 2",
    instructions: "Event test",
    model: "mock",
    tools: [],
    metadata: {},
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

check(
  "agent event unsubscribe",
  receivedAgentEvent === false,
);


// ============================================================
// 41. WORKFLOW EVENT BUS
// ============================================================

const workflowEventBus =
  new WorkflowEventBus();

let receivedWorkflowEvent = false;

workflowEventBus.subscribe(
  "workflow.created",
  (event) => {
    receivedWorkflowEvent =
      event.type === "workflow.created" &&
      event.workflow.id === "event_workflow";
  },
);

await workflowEventBus.publish({
  id: "workflow_event_1",
  type: "workflow.created",
  timestamp: new Date().toISOString(),
  workflow: {
    id: "event_workflow",
    tenantId: tenantA,
    name: "Event Workflow",
    steps: [],
    status: "draft",
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

check(
  "workflow event publish",
  receivedWorkflowEvent === true,
);


// ============================================================
// 42. AGENT WORKER
// ============================================================

const agentWorker =
  new DefaultAgentWorker();

const agentWorkerResult =
  await agentWorker.execute(job);

check(
  "agent worker executes job",
  (agentWorkerResult as {
    jobId: string;
  }).jobId === job.id,
);

check(
  "agent worker returns agent id",
  (agentWorkerResult as {
    agentId: string;
  }).agentId === job.agentId,
);

check(
  "agent worker returns completed status",
  (agentWorkerResult as {
    status: string;
  }).status === "completed",
);


// ============================================================
// 43. ENTERPRISE AGENT WORKER
// ============================================================

const enterpriseWorker =
  new DefaultEnterpriseAgentWorker();

const workerAgent =
  await enterpriseService.create({
    tenantId: "worker_tenant",
    name: "Worker Agent",
    instructions: "Worker test",
  });

const enterpriseWorkerResult =
  await enterpriseWorker.execute(
    workerAgent,
    {
      message: "worker input",
    },
  );

check(
  "enterprise agent worker executes",
  (enterpriseWorkerResult as {
    agentId: string;
  }).agentId === workerAgent.id,
);

check(
  "enterprise agent worker completes",
  (enterpriseWorkerResult as {
    status: string;
  }).status === "completed",
);


// ============================================================
// 44. WORKFLOW WORKER
// ============================================================

const workflowWorker =
  new DefaultWorkflowWorker();

const workerWorkflow =
  await workflowService.create({
    tenantId: "worker_tenant",
    name: "Worker Workflow",
    steps: [
      {
        id: "worker_step",
        name: "Worker Step",
        type: "input",
        config: {},
      },
    ],
  });

const workflowWorkerResult =
  await workflowWorker.execute(
    workerWorkflow,
    {
      input: "worker",
    },
  );

check(
  "workflow worker executes",
  (workflowWorkerResult as {
    workflowId: string;
  }).workflowId === workerWorkflow.id,
);

check(
  "workflow worker completes",
  (workflowWorkerResult as {
    status: string;
  }).status === "completed",
);

check(
  "workflow worker returns steps",
  (
    workflowWorkerResult as {
      steps: string[];
    }
  ).steps.includes("worker_step"),
);


// ============================================================
// 45. APPROVAL WORKER
// ============================================================

const approvalWorker =
  new ApprovalWorker();

const approved =
  approvalWorker.approve(
    "approval_1",
    "Mock approval",
  );

check(
  "approval worker approve",
  approved.approved === true &&
    approved.id === "approval_1",
);

const rejected =
  approvalWorker.reject(
    "approval_2",
    "Mock rejection",
  );

check(
  "approval worker reject",
  rejected.approved === false &&
    rejected.id === "approval_2",
);

assert.throws(
  () =>
    approvalWorker.approve(""),
);

passed += 1;
console.log("✓ approval worker validation");


// ============================================================
// 46. INPUT CLONING
// ============================================================

const mutableInput = {
  nested: {
    value: "original",
  },
};

const clonedJob =
  jobService.create({
    tenantId: tenantA,
    agentId: "agent_mock",
    name: "Clone Test",
    input: mutableInput,
  });

mutableInput.nested.value = "changed";

check(
  "job input is cloned",
  (
    clonedJob.input as {
      nested: {
        value: string;
      };
    }
  ).nested.value === "original",
);


// ============================================================
// 47. AGENT TOOL CLONING
// ============================================================

const tools = [
  {
    name: "mock-tool",
    config: {
      enabled: true,
    },
  },
];

const clonedToolAgent =
  await enterpriseService.create({
    tenantId: "clone_tenant",
    name: "Clone Agent",
    instructions: "Clone test",
    tools,
  });

tools[0].config.enabled = false;

check(
  "enterprise agent tools are cloned",
  clonedToolAgent.tools[0].config?.enabled === true,
);


// ============================================================
// 48. METADATA CLONING
// ============================================================

const metadata = {
  nested: {
    enabled: true,
  },
};

const metadataAgent =
  await enterpriseService.create({
    tenantId: "metadata_tenant",
    name: "Metadata Agent",
    instructions: "Metadata test",
    metadata,
  });

metadata.nested.enabled = false;

check(
  "enterprise agent metadata is cloned",
  (
    metadataAgent.metadata.nested as {
      enabled: boolean;
    }
  ).enabled === true,
);


// ============================================================
// 49. MISSING WORKFLOW
// ============================================================

await expectError(
  "missing workflow handling",
  () =>
    workflowService.getById(
      tenantA,
      "missing-workflow",
    ),
  NotFoundError,
);


// ============================================================
// 50. MISSING AGENT
// ============================================================

await expectError(
  "missing enterprise agent handling",
  () =>
    enterpriseService.getById(
      tenantA,
      "missing-agent",
    ),
  NotFoundError,
);


// ============================================================
// FINAL RESULT
// ============================================================

console.log("");
console.log(
  `Total Agents mock tests passed: ${passed}`,
);
console.log("");
console.log(
  "All ModelNow Agents mock tests passed.",
);
console.log("");
