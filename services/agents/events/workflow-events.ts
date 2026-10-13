import type { Workflow } from "../workflows/workflow-schema.js";

export type WorkflowEventType =
  | "workflow.created"
  | "workflow.updated"
  | "workflow.activated"
  | "workflow.paused"
  | "workflow.archived"
  | "workflow.deleted";

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventType;
  workflow: Workflow;
  timestamp: string;
}

export type WorkflowEventHandler =
  (event: WorkflowEvent) => void | Promise<void>;

export class WorkflowEventBus {
  private readonly handlers = new Map<
    WorkflowEventType,
    Set<WorkflowEventHandler>
  >();

  subscribe(
    type: WorkflowEventType,
    handler: WorkflowEventHandler,
  ): () => void {
    let handlers = this.handlers.get(type);

    if (!handlers) {
      handlers = new Set();
      this.handlers.set(type, handlers);
    }

    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
    };
  }

  async publish(event: WorkflowEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export const workflowEventBus = new WorkflowEventBus();

