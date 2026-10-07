import type { EnterpriseAgent } from "../enterprise/enterprise-agent-schema.js";

export type AgentEventType =
  | "agent.created"
  | "agent.updated"
  | "agent.activated"
  | "agent.paused"
  | "agent.archived"
  | "agent.deleted";

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  agent: EnterpriseAgent;
  timestamp: string;
}

export type AgentEventHandler =
  (event: AgentEvent) => void | Promise<void>;

export class AgentEventBus {
  private readonly handlers = new Map<
    AgentEventType,
    Set<AgentEventHandler>
  >();

  subscribe(
    type: AgentEventType,
    handler: AgentEventHandler,
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

  async publish(event: AgentEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export const agentEventBus = new AgentEventBus();

