import { create } from "zustand";

interface Agent {
  id: number;
  name: string;
  status: string;
}

interface AgentStore {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  removeAgent: (id: number) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),
}));