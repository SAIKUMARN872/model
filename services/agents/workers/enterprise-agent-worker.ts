import type { EnterpriseAgent } from "../enterprise/enterprise-agent-schema.js";

export interface EnterpriseAgentWorker {
  execute(
    agent: EnterpriseAgent,
    input?: unknown,
  ): Promise<unknown>;
}

export class DefaultEnterpriseAgentWorker
  implements EnterpriseAgentWorker
{
  async execute(
    agent: EnterpriseAgent,
    input?: unknown,
  ): Promise<unknown> {
    return {
      agentId: agent.id,
      status: "completed",
      input,
    };
  }
}

export const enterpriseAgentWorker =
  new DefaultEnterpriseAgentWorker();

