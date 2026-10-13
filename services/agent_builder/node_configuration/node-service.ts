import {
  CreateNodeInput,
  NodeType,
  UpdateNodeInput,
  WorkflowNode,
} from "./node-schema.js";

import {
  InMemoryNodeRepository,
  NodeRepository,
} from "./node-repository.js";

export class NodeConfigurationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "NodeConfigurationError";
  }
}

export class NodeConfigurationService {
  constructor(
    private readonly repository: NodeRepository =
      new InMemoryNodeRepository(),
  ) {}

  create(input: CreateNodeInput): WorkflowNode {
    this.validateWorkflowId(input?.workflowId);
    this.validateName(input?.name);
    this.validateNodeType(input?.type);

    return this.repository.create({
      workflowId: input.workflowId.trim(),
      name: input.name.trim(),
      type: input.type,
      position: input.position ?? { x: 0, y: 0 },
      config: input.config ?? {},
      inputs: input.inputs ?? [],
      outputs: input.outputs ?? [],
    });
  }

  getById(id: string): WorkflowNode {
    this.validateId(id);

    const node = this.repository.findById(id);

    if (!node) {
      throw new NodeConfigurationError(
        "Node not found.",
        "NODE_NOT_FOUND",
      );
    }

    return node;
  }

  list(): WorkflowNode[] {
    return this.repository.findAll();
  }

  listByWorkflowId(workflowId: string): WorkflowNode[] {
    this.validateWorkflowId(workflowId);
    return this.repository.findByWorkflowId(workflowId.trim());
  }

  update(id: string, input: UpdateNodeInput): WorkflowNode {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new NodeConfigurationError(
        "Node update is required.",
        "VALIDATION_ERROR",
      );
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    if (input.type !== undefined) {
      this.validateNodeType(input.type);
    }

    const updated = this.repository.update(id, input);

    if (!updated) {
      throw new NodeConfigurationError(
        "Node not found.",
        "NODE_NOT_FOUND",
      );
    }

    return updated;
  }

  delete(id: string): boolean {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new NodeConfigurationError(
        "Node not found.",
        "NODE_NOT_FOUND",
      );
    }

    return true;
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new NodeConfigurationError(
        "Node id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateWorkflowId(workflowId: string): void {
    if (
      typeof workflowId !== "string" ||
      workflowId.trim().length === 0
    ) {
      throw new NodeConfigurationError(
        "Workflow id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateName(name: string): void {
    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      throw new NodeConfigurationError(
        "Node name is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateNodeType(type: NodeType): void {
    const validTypes: NodeType[] = [
      "input",
      "output",
      "llm",
      "tool",
      "condition",
      "transform",
      "http",
      "delay",
    ];

    if (!validTypes.includes(type)) {
      throw new NodeConfigurationError(
        "Invalid node type.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const nodeConfigurationService =
  new NodeConfigurationService();

export type {
  CreateNodeInput,
  NodeType,
  UpdateNodeInput,
  WorkflowNode,
};
