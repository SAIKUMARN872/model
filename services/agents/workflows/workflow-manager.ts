import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from "./workflow-schema.js";

import { workflowService } from "./workflow-service.js";

export class WorkflowManager {
  create(input: CreateWorkflowInput) {
    return workflowService.create(input);
  }

  getById(tenantId: string, id: string) {
    return workflowService.getById(tenantId, id);
  }

  list(tenantId: string) {
    return workflowService.list(tenantId);
  }

  update(
    tenantId: string,
    id: string,
    input: UpdateWorkflowInput,
  ) {
    return workflowService.update(
      tenantId,
      id,
      input,
    );
  }

  activate(tenantId: string, id: string) {
    return workflowService.activate(tenantId, id);
  }

  pause(tenantId: string, id: string) {
    return workflowService.pause(tenantId, id);
  }

  archive(tenantId: string, id: string) {
    return workflowService.archive(tenantId, id);
  }

  delete(tenantId: string, id: string) {
    return workflowService.delete(tenantId, id);
  }
}

export const workflowManager = new WorkflowManager();

