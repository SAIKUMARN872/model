import type {
  AgentStatus,
  EnterpriseAgent,
} from "../enterprise/enterprise-agent-schema.js";

import {
  enterpriseAgentService,
} from "../enterprise/enterprise-agent-service.js";

import type {
  CreateAgentInput,
  UpdateAgentInput,
} from "./agent-schema.js";

export class AgentService {
  async create(
    input: CreateAgentInput,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.create(input);
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.getById(tenantId, id);
  }

  async list(
    tenantId: string,
    status?: AgentStatus,
  ): Promise<EnterpriseAgent[]> {
    return enterpriseAgentService.list(tenantId, status);
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateAgentInput,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.update(tenantId, id, input);
  }

  async activate(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.activate(tenantId, id);
  }

  async pause(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.pause(tenantId, id);
  }

  async archive(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return enterpriseAgentService.archive(tenantId, id);
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    return enterpriseAgentService.delete(tenantId, id);
  }
}

export const agentService = new AgentService();

