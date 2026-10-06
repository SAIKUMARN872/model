import assert from "node:assert/strict";
import {
  AgentExecutionService,
  ExecutionNotFoundError,
  InvalidExecutionError,
} from "./execution-service.js";

console.log("Running ModelNow Agent Execution Service tests...");
console.log("");

const service = new AgentExecutionService();

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`? ${name}`);
  } catch (error) {
    console.error(`? ${name}`);
    throw error;
  }
}

let executionId = "";

test("create execution", () => {
  const execution = service.create({
    agentId: "agent_test_001",
    input: {
      prompt: "Hello ModelNow",
    },
  });

  assert.ok(execution.id);
  assert.equal(execution.agentId, "agent_test_001");
  assert.equal(execution.status, "queued");
  assert.deepEqual(execution.input, {
    prompt: "Hello ModelNow",
  });

  executionId = execution.id;
});

test("get execution", () => {
  const execution = service.getById(executionId);

  assert.equal(execution.id, executionId);
  assert.equal(execution.agentId, "agent_test_001");
  assert.equal(execution.status, "queued");
});

test("list executions", () => {
  const executions = service.list();

  assert.equal(executions.length, 1);
  assert.equal(executions[0].id, executionId);
});

test("list executions by agent", () => {
  const executions = service.listByAgentId("agent_test_001");

  assert.equal(executions.length, 1);
  assert.equal(executions[0].agentId, "agent_test_001");
});

test("start execution", () => {
  const execution = service.start(executionId);

  assert.equal(execution.status, "running");
  assert.ok(execution.startedAt);
  assert.ok(execution.updatedAt);
});

test("complete execution", () => {
  const execution = service.complete(executionId, {
    result: "success",
  });

  assert.equal(execution.status, "completed");
  assert.deepEqual(execution.output, {
    result: "success",
  });
  assert.ok(execution.completedAt);
});

test("create second execution", () => {
  const execution = service.create({
    agentId: "agent_test_002",
    input: {
      prompt: "Failure test",
    },
  });

  assert.ok(execution.id);
  assert.equal(execution.agentId, "agent_test_002");
  assert.equal(execution.status, "queued");
});

test("fail execution", () => {
  const executions = service.listByAgentId("agent_test_002");

  assert.equal(executions.length, 1);

  const execution = service.fail(
    executions[0].id,
    "Model execution failed",
  );

  assert.equal(execution.status, "failed");
  assert.equal(execution.error, "Model execution failed");
  assert.ok(execution.completedAt);
});

test("cancel execution", () => {
  const execution = service.create({
    agentId: "agent_test_003",
  });

  const cancelled = service.cancel(execution.id);

  assert.equal(cancelled.status, "cancelled");
  assert.ok(cancelled.completedAt);
});

test("invalid agent id validation", () => {
  assert.throws(
    () =>
      service.create({
        agentId: "",
      }),
    InvalidExecutionError,
  );
});

test("invalid execution id validation", () => {
  assert.throws(
    () => service.getById(""),
    InvalidExecutionError,
  );
});

test("missing execution handling", () => {
  assert.throws(
    () => service.getById("missing_execution"),
    ExecutionNotFoundError,
  );
});

test("missing execution update handling", () => {
  assert.throws(
    () =>
      service.update("missing_execution", {
        status: "running",
      }),
    ExecutionNotFoundError,
  );
});

test("invalid execution error validation", () => {
  assert.throws(
    () => service.fail(executionId, ""),
    InvalidExecutionError,
  );
});

test("delete execution", () => {
  service.delete(executionId);

  assert.throws(
    () => service.getById(executionId),
    ExecutionNotFoundError,
  );
});

test("verify deletion", () => {
  assert.equal(
    service.listByAgentId("agent_test_001").length,
    0,
  );
});

console.log("");
console.log("All ModelNow Agent Execution Service tests passed.");

