import type { Workflow } from "../workflows/workflow-schema.js";

export interface WorkflowWorker {
  execute(
    workflow: Workflow,
    input?: unknown,
  ): Promise<unknown>;
}

export class DefaultWorkflowWorker
  implements WorkflowWorker
{
  async execute(
    workflow: Workflow,
    input?: unknown,
  ): Promise<unknown> {
    return {
      workflowId: workflow.id,
      status: "completed",
      input,
      steps: workflow.steps.map((step) => step.id),
    };
  }
}

export const workflowWorker =
  new DefaultWorkflowWorker();

