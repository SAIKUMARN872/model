import {
  CreateNodeInput,
  UpdateNodeInput,
  WorkflowNode,
} from "./node-schema.js";

export interface NodeRepository {
  create(input: CreateNodeInput): WorkflowNode;
  findById(id: string): WorkflowNode | undefined;
  findByWorkflowId(workflowId: string): WorkflowNode[];
  findAll(): WorkflowNode[];
  update(id: string, input: UpdateNodeInput): WorkflowNode | undefined;
  delete(id: string): boolean;
}

export class InMemoryNodeRepository implements NodeRepository {
  private readonly nodes = new Map<string, WorkflowNode>();

  create(input: CreateNodeInput): WorkflowNode {
    const now = new Date().toISOString();

    const node: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      workflowId: input.workflowId,
      name: input.name,
      type: input.type,
      position: input.position ?? { x: 0, y: 0 },
      config: structuredClone(input.config ?? {}),
      inputs: [...(input.inputs ?? [])],
      outputs: [...(input.outputs ?? [])],
      createdAt: now,
      updatedAt: now,
    };

    this.nodes.set(node.id, node);

    return structuredClone(node);
  }

  findById(id: string): WorkflowNode | undefined {
    const node = this.nodes.get(id);
    return node ? structuredClone(node) : undefined;
  }

  findByWorkflowId(workflowId: string): WorkflowNode[] {
    return Array.from(this.nodes.values())
      .filter((node) => node.workflowId === workflowId)
      .map((node) => structuredClone(node));
  }

  findAll(): WorkflowNode[] {
    return Array.from(this.nodes.values()).map((node) =>
      structuredClone(node),
    );
  }

  update(
    id: string,
    input: UpdateNodeInput,
  ): WorkflowNode | undefined {
    const existing = this.nodes.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: WorkflowNode = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.position !== undefined
        ? { position: structuredClone(input.position) }
        : {}),
      ...(input.config !== undefined
        ? { config: structuredClone(input.config) }
        : {}),
      ...(input.inputs !== undefined
        ? { inputs: [...input.inputs] }
        : {}),
      ...(input.outputs !== undefined
        ? { outputs: [...input.outputs] }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(id, updated);

    return structuredClone(updated);
  }

  delete(id: string): boolean {
    return this.nodes.delete(id);
  }
}
