import {
  enterpriseAgentService,
} from "./enterprise-agent-service.js";

import type {
  CreateEnterpriseAgentInput,
  UpdateEnterpriseAgentInput,
} from "./enterprise-agent-schema.js";

export class EnterpriseAgentController {
  constructor(
    private readonly service = enterpriseAgentService,
  ) {}

  create(input: CreateEnterpriseAgentInput) {
    return this.service.create(input);
  }

  get(tenantId: string, id: string) {
    return this.service.getById(tenantId, id);
  }

  list(tenantId: string) {
    return this.service.list(tenantId);
  }

  update(
    tenantId: string,
    id: string,
    input: UpdateEnterpriseAgentInput,
  ) {
    return this.service.update(tenantId, id, input);
  }

  activate(tenantId: string, id: string) {
    return this.service.activate(tenantId, id);
  }

  pause(tenantId: string, id: string) {
    return this.service.pause(tenantId, id);
  }

  archive(tenantId: string, id: string) {
    return this.service.archive(tenantId, id);
  }

  delete(tenantId: string, id: string) {
    return this.service.delete(tenantId, id);
  }
}

export const enterpriseAgentController =
  new EnterpriseAgentController();
