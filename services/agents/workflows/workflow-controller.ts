import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from "./workflow-schema.js";

import { workflowManager } from "./workflow-manager.js";

export class WorkflowController {
  create(input: CreateWorkflowInput) {
    return workflowManager.create(input);
  }

  get(
    tenantId: string,
    id: string,
  ) {
    return workflowManager.getById(tenantId, id);
  }

  list(tenantId: string) {
    return workflowManager.list(tenantId);
  }

  update(
    tenantId: string,
    id: string,
    input: UpdateWorkflowInput,
  ) {
    return workflowManager.update(
      tenantId,
      id,
      input,
    );
  }

  activate(
    tenantId: string,
    id: string,
  ) {
    return workflowManager.activate(tenantId, id);
  }

  pause(
    tenantId: string,
    id: string,
  ) {
    return workflowManager.pause(tenantId, id);
  }

  archive(
    tenantId: string,
    id: string,
  ) {
    return workflowManager.archive(tenantId, id);
  }

  delete(
    tenantId: string,
    id: string,
  ) {
    return workflowManager.delete(tenantId, id);
  }
}

export const workflowController =
  new WorkflowController();

