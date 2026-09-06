export interface AgentRequest {
  userId: string;
  sessionId: string;
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  id: string;
  agentId: string;
  content: string;
  success: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export class AgentService {
  private readonly agents = new Map<string, Agent>();

  private initialized = false;

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.registerAgent({
      id: "default",
      name: "Default Agent",
      description: "General purpose AI assistant",
      enabled: true,
    });

    this.initialized = true;
  }

  public registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  public unregisterAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public hasAgent(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  public async execute(
    agentId: string,
    request: AgentRequest
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`Agent '${agentId}' not found.`);
    }

    if (!agent.enabled) {
      throw new Error(`Agent '${agentId}' is disabled.`);
    }

    const response: AgentResponse = {
      id: this.generateId(),
      agentId: agent.id,
      content: `Processed request: ${request.prompt}`,
      success: true,
      createdAt: new Date().toISOString(),
      metadata: {
        userId: request.userId,
        sessionId: request.sessionId,
      },
    };

    return response;
  }

  public async shutdown(): Promise<void> {
    this.agents.clear();
    this.initialized = false;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10)
    );
  }
}

const agentService = new AgentService();
agentService.initialize();

export default agentService;