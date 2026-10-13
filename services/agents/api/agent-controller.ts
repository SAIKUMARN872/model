import type {
  CreateAgentInput,
  UpdateAgentInput,
} from "./agent-schema.js";

import { agentService } from "./agent-service.js";

export class AgentController {
  async create(input: CreateAgentInput) {
    return agentService.create(input);
  }

  async get(
    tenantId: string,
    id: string,
  ) {
    return agentService.getById(tenantId, id);
  }

  async list(tenantId: string) {
    return agentService.list(tenantId);
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateAgentInput,
  ) {
    return agentService.update(tenantId, id, input);
  }

  async activate(
    tenantId: string,
    id: string,
  ) {
    return agentService.activate(tenantId, id);
  }

  async pause(
    tenantId: string,
    id: string,
  ) {
    return agentService.pause(tenantId, id);
  }

  async archive(
    tenantId: string,
    id: string,
  ) {
    return agentService.archive(tenantId, id);
  }

  async delete(
    tenantId: string,
    id: string,
  ) {
    return agentService.delete(tenantId, id);
  }
}

export const agentController = new AgentController();

