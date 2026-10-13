export type NodeType =
  | "input"
  | "output"
  | "llm"
  | "tool"
  | "condition"
  | "transform"
  | "http"
  | "delay";

export interface WorkflowNode {
  id: string;
  workflowId: string;
  name: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  config: Record<string, unknown>;
  inputs: string[];
  outputs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeInput {
  workflowId: string;
  name: string;
  type: NodeType;
  position?: {
    x: number;
    y: number;
  };
  config?: Record<string, unknown>;
  inputs?: string[];
  outputs?: string[];
}

export interface UpdateNodeInput {
  name?: string;
  type?: NodeType;
  position?: {
    x: number;
    y: number;
  };
  config?: Record<string, unknown>;
  inputs?: string[];
  outputs?: string[];
}
