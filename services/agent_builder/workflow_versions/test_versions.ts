import {
  WorkflowVersionError,
  WorkflowVersionService,
} from "./version-service.js";

const service = new WorkflowVersionService();

console.log("Running ModelNow Agent Builder Workflow Version Service tests...");

const version = service.create({
  workflowId: "workflow_test_1",
  name: "Version 1",
  definition: {
    nodes: ["node_1"],
    edges: [],
  },
});

console.assert(
  version.id.length > 0,
  "create version",
);
console.assert(
  version.workflowId === "workflow_test_1",
  "create version workflow",
);
console.assert(
  version.version === 1,
  "create version number",
);
console.assert(
  version.status === "draft",
  "create version status",
);
console.log("? create version");

const fetched = service.getById(
  version.id,
);

console.assert(
  fetched.id === version.id,
  "get version",
);
console.log("? get version");

const listed = service.listByWorkflowId(
  "workflow_test_1",
);

console.assert(
  listed.length === 1,
  "list versions",
);
console.log("? list versions");

const latest = service.latest(
  "workflow_test_1",
);

console.assert(
  latest.id === version.id,
  "latest version",
);
console.log("? latest version");

const updated = service.update(
  version.id,
  {
    name: "Updated Version",
  },
);

console.assert(
  updated.name === "Updated Version",
  "update version",
);
console.log("? update version");

const published = service.publish(
  version.id,
);

console.assert(
  published.status === "published",
  "publish version",
);
console.assert(
  published.publishedAt !== undefined,
  "publish version timestamp",
);
console.log("? publish version");

try {
  service.update(
    version.id,
    {
      name: "Cannot Update",
    },
  );

  throw new Error(
    "Expected published version update error",
  );
} catch (error) {
  console.assert(
    error instanceof WorkflowVersionError,
    "published version protection",
  );
}
console.log("? published version protection");

try {
  service.create({
    workflowId: "",
    definition: {},
  });

  throw new Error(
    "Expected invalid workflow id error",
  );
} catch (error) {
  console.assert(
    error instanceof WorkflowVersionError,
    "invalid workflow validation",
  );
}
console.log("? invalid workflow validation");

try {
  service.getById(
    "missing_version",
  );

  throw new Error(
    "Expected missing version error",
  );
} catch (error) {
  console.assert(
    error instanceof WorkflowVersionError,
    "missing version handling",
  );
}
console.log("? missing version handling");

const deleteVersion = service.create({
  workflowId: "workflow_test_2",
  definition: {
    nodes: [],
    edges: [],
  },
});

service.delete(
  deleteVersion.id,
);

console.log("? delete version");

try {
  service.getById(
    deleteVersion.id,
  );

  throw new Error(
    "Expected deleted version error",
  );
} catch (error) {
  console.assert(
    error instanceof WorkflowVersionError,
    "verify deletion",
  );
}
console.log("? verify deletion");

try {
  service.delete(
    version.id,
  );

  throw new Error(
    "Expected published version deletion protection",
  );
} catch (error) {
  console.assert(
    error instanceof WorkflowVersionError,
    "published version deletion protection",
  );
}
console.log("? published version deletion protection");

console.log("");
console.log(
  "All ModelNow Agent Builder Workflow Version Service tests passed.",
);
