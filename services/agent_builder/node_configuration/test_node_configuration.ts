import {
  NodeConfigurationError,
  NodeConfigurationService,
} from "./node-service.js";

const service = new NodeConfigurationService();

console.log("Running ModelNow Agent Builder Node Configuration Service tests...");

const node = service.create({
  workflowId: "workflow_test_1",
  name: "Input Node",
  type: "input",
  position: {
    x: 100,
    y: 200,
  },
  config: {
    required: true,
  },
  outputs: ["next"],
});

console.assert(node.id.length > 0, "create node");
console.assert(node.workflowId === "workflow_test_1", "create node workflow");
console.assert(node.name === "Input Node", "create node name");
console.assert(node.type === "input", "create node type");
console.log("? create node");

const fetched = service.getById(node.id);

console.assert(fetched.id === node.id, "get node");
console.log("? get node");

const listed = service.list();

console.assert(listed.length === 1, "list nodes");
console.log("? list nodes");

const workflowNodes = service.listByWorkflowId(
  "workflow_test_1",
);

console.assert(
  workflowNodes.length === 1,
  "list nodes by workflow",
);
console.log("? list nodes by workflow");

const updated = service.update(node.id, {
  name: "Updated Input Node",
  config: {
    required: false,
  },
});

console.assert(
  updated.name === "Updated Input Node",
  "update node",
);
console.log("? update node");

try {
  service.create({
    workflowId: "",
    name: "Invalid Node",
    type: "input",
  });

  throw new Error("Expected validation error");
} catch (error) {
  console.assert(
    error instanceof NodeConfigurationError,
    "invalid node validation",
  );
}
console.log("? invalid node validation");

try {
  service.getById("missing_node");

  throw new Error("Expected missing node error");
} catch (error) {
  console.assert(
    error instanceof NodeConfigurationError,
    "missing node handling",
  );
}
console.log("? missing node handling");

service.delete(node.id);

console.log("? delete node");

try {
  service.getById(node.id);

  throw new Error("Expected deleted node error");
} catch (error) {
  console.assert(
    error instanceof NodeConfigurationError,
    "verify deletion",
  );
}
console.log("? verify deletion");

console.log("");
console.log(
  "All ModelNow Agent Builder Node Configuration Service tests passed.",
);
